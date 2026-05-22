import asyncio
import io
import json
import uuid
from datetime import datetime, timezone

import paramiko
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.group import Group, terminal_group
from app.models.terminal import Terminal, TerminalStatus
from app.routers.auth import get_current_user
from app.services.ssh import test_ssh_connection
from app.services.system_info import collect_system_info

router = APIRouter(prefix="/terminals", tags=["terminals"])


class TerminalCreate(BaseModel):
    name: str
    hostname: str
    port: int = 22
    username: str = "ubuntu"
    ssh_key: str
    description: str | None = None


class TerminalOut(BaseModel):
    id: str
    name: str
    hostname: str
    port: int
    username: str
    description: str | None
    mac_address: str | None
    serial_number: str | None
    os_version: str | None
    status: str
    last_check: datetime | None
    groups: list[str]

    class Config:
        from_attributes = True


def _to_out(t: Terminal) -> TerminalOut:
    return TerminalOut(
        id=str(t.id),
        name=t.name,
        hostname=t.hostname,
        port=t.port,
        username=t.username,
        description=t.description,
        mac_address=t.mac_address,
        serial_number=t.serial_number,
        os_version=t.os_version,
        status=t.status,
        last_check=t.last_check,
        groups=[g.name for g in t.groups],
    )


@router.get("/", response_model=list[TerminalOut])
async def list_terminals(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Terminal).options(selectinload(Terminal.groups)))
    return [_to_out(t) for t in result.scalars().all()]


@router.post("/", response_model=TerminalOut)
async def create_terminal(data: TerminalCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    terminal = Terminal(**data.model_dump())
    db.add(terminal)
    await db.commit()
    await db.refresh(terminal, ["groups"])
    return _to_out(terminal)


@router.get("/{terminal_id}", response_model=TerminalOut)
async def get_terminal(terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)).options(selectinload(Terminal.groups))
    )
    terminal = result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")
    return _to_out(terminal)


@router.delete("/{terminal_id}", status_code=204)
async def delete_terminal(terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)))
    terminal = result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")
    await db.delete(terminal)
    await db.commit()


@router.post("/{terminal_id}/check", response_model=dict)
async def check_terminal(terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)))
    terminal = result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")

    success, message = test_ssh_connection(terminal.hostname, terminal.port, terminal.username, terminal.ssh_key)
    terminal.status = TerminalStatus.online if success else TerminalStatus.offline
    terminal.last_check = datetime.now(timezone.utc)
    await db.commit()
    return {"success": success, "message": message, "status": terminal.status}


@router.get("/{terminal_id}/details")
async def get_terminal_details(terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(
        select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)).options(selectinload(Terminal.groups))
    )
    terminal = result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")

    details = collect_system_info(terminal.hostname, terminal.port, terminal.username, terminal.ssh_key)
    return {**details, "terminal": _to_out(terminal)}


@router.post("/{terminal_id}/groups/{group_name}", status_code=204)
async def add_group_to_terminal(
    terminal_id: str, group_name: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    terminal_uuid = uuid.UUID(terminal_id)
    group_result = await db.execute(select(Group).where(Group.name == group_name))
    group = group_result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe introuvable")

    # Insertion directe (ignore si déjà présent)
    await db.execute(
        pg_insert(terminal_group)
        .values(terminal_id=terminal_uuid, group_id=group.id)
        .on_conflict_do_nothing()
    )

    # Retirer "Unconfigured" si on ajoute un autre tag
    if group_name != "Unconfigured":
        unconfigured = await db.execute(select(Group).where(Group.name == "Unconfigured"))
        unc = unconfigured.scalar_one_or_none()
        if unc:
            await db.execute(
                terminal_group.delete().where(
                    terminal_group.c.terminal_id == terminal_uuid,
                    terminal_group.c.group_id == unc.id,
                )
            )

    await db.commit()


@router.delete("/{terminal_id}/groups/{group_name}", status_code=204)
async def remove_group_from_terminal(
    terminal_id: str, group_name: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    terminal_uuid = uuid.UUID(terminal_id)
    group_result = await db.execute(select(Group).where(Group.name == group_name))
    group = group_result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe introuvable")

    await db.execute(
        terminal_group.delete().where(
            terminal_group.c.terminal_id == terminal_uuid,
            terminal_group.c.group_id == group.id,
        )
    )
    await db.commit()


@router.websocket("/{terminal_id}/ssh")
async def terminal_ssh_ws(
    websocket: WebSocket,
    terminal_id: str,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    from app.services.auth import decode_token

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    result = await db.execute(select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)))
    terminal = result.scalar_one_or_none()
    if not terminal:
        await websocket.close(code=4004)
        return

    await websocket.accept()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    channel = None

    try:
        key = paramiko.RSAKey.from_private_key(io.StringIO(terminal.ssh_key))
        await asyncio.to_thread(
            lambda: client.connect(
                hostname=terminal.hostname,
                port=terminal.port,
                username=terminal.username,
                pkey=key,
                timeout=15,
            )
        )
        channel = client.invoke_shell(term="xterm-256color", width=220, height=50)

        async def ssh_to_ws():
            loop = asyncio.get_event_loop()
            try:
                while True:
                    data = await loop.run_in_executor(None, channel.recv, 4096)
                    if not data:
                        break
                    await websocket.send_text(data.decode("utf-8", errors="replace"))
            except Exception:
                pass

        async def ws_to_ssh():
            try:
                while True:
                    msg = await websocket.receive_text()
                    try:
                        parsed = json.loads(msg)
                        if parsed.get("type") == "resize":
                            channel.resize_pty(width=parsed["cols"], height=parsed["rows"])
                            continue
                    except (json.JSONDecodeError, KeyError):
                        pass
                    channel.send(msg.encode())
            except (WebSocketDisconnect, Exception):
                pass

        t1 = asyncio.create_task(ssh_to_ws())
        t2 = asyncio.create_task(ws_to_ssh())
        _, pending = await asyncio.wait([t1, t2], return_when=asyncio.FIRST_COMPLETED)
        for t in pending:
            t.cancel()

    except Exception as e:
        try:
            await websocket.send_text(f"\r\n\x1b[31mErreur SSH : {e}\x1b[0m\r\n")
        except Exception:
            pass
    finally:
        if channel:
            try:
                channel.close()
            except Exception:
                pass
        client.close()
        try:
            await websocket.close()
        except Exception:
            pass


@router.patch("/{terminal_id}", response_model=TerminalOut)
async def update_terminal(
    terminal_id: str, data: TerminalCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    result = await db.execute(
        select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)).options(selectinload(Terminal.groups))
    )
    terminal = result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(terminal, field, value)
    await db.commit()
    await db.refresh(terminal, ["groups"])
    return _to_out(terminal)
