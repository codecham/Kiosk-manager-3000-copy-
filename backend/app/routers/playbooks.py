import os
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.playbook_run import PlaybookRun
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.ansible import list_playbooks

router = APIRouter(prefix="/playbooks", tags=["playbooks"])

SSH_KEY_PATH = "/app/ssh_keys/console.key"


class RunCreate(BaseModel):
    name: str
    playbook_path: str
    target_groups: list[str] = []
    target_hosts: list[str] = []
    extra_vars: dict = {}


class PlaybookCreate(BaseModel):
    filename: str
    content: str


class RunOut(BaseModel):
    id: str
    name: str
    playbook_path: str
    target_groups: list[str]
    target_hosts: list[str]
    status: str
    output: str | None
    created_at: str

    class Config:
        from_attributes = True


def _run_to_out(r: PlaybookRun) -> RunOut:
    return RunOut(
        id=str(r.id),
        name=r.name,
        playbook_path=r.playbook_path,
        target_groups=r.target_groups,
        target_hosts=r.target_hosts,
        status=r.status,
        output=r.output,
        created_at=r.created_at.isoformat(),
    )


@router.get("/available")
async def get_available_playbooks(_=Depends(get_current_user)):
    return {"playbooks": list_playbooks()}


@router.get("/runs", response_model=list[RunOut])
async def list_runs(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(PlaybookRun).order_by(PlaybookRun.created_at.desc()).limit(100))
    return [_run_to_out(r) for r in result.scalars().all()]


@router.post("/runs", response_model=RunOut)
async def launch_run(
    data: RunCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    from app.workers.celery_app import run_playbook_task
    from app.models.group import Group
    from app.models.terminal import Terminal
    from sqlalchemy.orm import selectinload

    inventory: dict = {"all": {"hosts": {}, "children": {}}}

    if data.target_groups:
        result = await db.execute(
            select(Group).where(Group.name.in_(data.target_groups)).options(selectinload(Group.terminals))
        )
        for group in result.scalars().all():
            inventory["all"]["children"][group.name] = {
                "hosts": {
                    t.hostname: {
                        "ansible_user": t.username,
                        "ansible_port": t.port,
                        "ansible_ssh_private_key_file": SSH_KEY_PATH,
                        "ansible_host_key_checking": "False",
                    }
                    for t in group.terminals
                }
            }

    if data.target_hosts:
        result = await db.execute(
            select(Terminal).where(Terminal.id.in_([uuid.UUID(h) for h in data.target_hosts]))
        )
        for t in result.scalars().all():
            inventory["all"]["hosts"][t.hostname] = {
                "ansible_user": t.username,
                "ansible_port": t.port,
                "ansible_ssh_private_key_file": SSH_KEY_PATH,
                "ansible_host_key_checking": "False",
            }

    run = PlaybookRun(
        name=data.name,
        playbook_path=data.playbook_path,
        target_groups=data.target_groups,
        target_hosts=data.target_hosts,
        extra_vars=data.extra_vars,
        user_id=current_user.id,
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)

    run_playbook_task.delay(str(run.id), data.playbook_path, inventory, data.extra_vars)
    return _run_to_out(run)


@router.post("/create", status_code=201)
async def create_playbook(data: PlaybookCreate, _=Depends(get_current_user)):
    filename = data.filename.strip()
    if not filename:
        raise HTTPException(status_code=400, detail="Nom de fichier invalide")
    if not filename.endswith((".yml", ".yaml")):
        filename += ".yml"
    if any(c in filename for c in ("/", "\\", "..")):
        raise HTTPException(status_code=400, detail="Nom de fichier invalide")

    playbooks_dir = os.path.join(settings.ansible_base_path, "playbooks")
    os.makedirs(playbooks_dir, exist_ok=True)

    with open(os.path.join(playbooks_dir, filename), "w") as f:
        f.write(data.content)

    return {"filename": filename, "message": "Playbook créé avec succès"}


@router.get("/runs/{run_id}", response_model=RunOut)
async def get_run(run_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    run = await db.get(PlaybookRun, uuid.UUID(run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Exécution introuvable")
    return _run_to_out(run)
