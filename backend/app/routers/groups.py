import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.group import Group
from app.models.terminal import Terminal
from app.routers.auth import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])


class GroupCreate(BaseModel):
    name: str
    description: str | None = None


class GroupOut(BaseModel):
    id: str
    name: str
    description: str | None
    terminal_count: int

    class Config:
        from_attributes = True


class GroupDetail(GroupOut):
    terminals: list[str]


@router.get("/", response_model=list[GroupOut])
async def list_groups(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Group).options(selectinload(Group.terminals)))
    return [
        GroupOut(id=str(g.id), name=g.name, description=g.description, terminal_count=len(g.terminals))
        for g in result.scalars().all()
    ]


@router.post("/", response_model=GroupOut)
async def create_group(data: GroupCreate, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    existing = await db.execute(select(Group).where(Group.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Un groupe avec ce nom existe déjà")
    group = Group(**data.model_dump())
    db.add(group)
    await db.commit()
    await db.refresh(group, ["terminals"])
    return GroupOut(id=str(group.id), name=group.name, description=group.description, terminal_count=0)


@router.delete("/{group_id}", status_code=204)
async def delete_group(group_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    result = await db.execute(select(Group).where(Group.id == uuid.UUID(group_id)))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe introuvable")
    await db.delete(group)
    await db.commit()


@router.post("/{group_id}/terminals/{terminal_id}", status_code=204)
async def add_terminal_to_group(
    group_id: str, terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    group_result = await db.execute(
        select(Group).where(Group.id == uuid.UUID(group_id)).options(selectinload(Group.terminals))
    )
    group = group_result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe introuvable")

    terminal_result = await db.execute(select(Terminal).where(Terminal.id == uuid.UUID(terminal_id)))
    terminal = terminal_result.scalar_one_or_none()
    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal introuvable")

    if terminal not in group.terminals:
        group.terminals.append(terminal)
        await db.commit()


@router.delete("/{group_id}/terminals/{terminal_id}", status_code=204)
async def remove_terminal_from_group(
    group_id: str, terminal_id: str, db: AsyncSession = Depends(get_db), _=Depends(get_current_user)
):
    group_result = await db.execute(
        select(Group).where(Group.id == uuid.UUID(group_id)).options(selectinload(Group.terminals))
    )
    group = group_result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Groupe introuvable")

    group.terminals = [t for t in group.terminals if str(t.id) != terminal_id]
    await db.commit()
