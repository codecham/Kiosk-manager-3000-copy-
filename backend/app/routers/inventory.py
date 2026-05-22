"""
Endpoint d'inventaire dynamique Ansible.
Ansible peut appeler GET /api/inventory?list=true pour obtenir l'inventaire JSON.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.group import Group
from app.models.terminal import Terminal

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/")
async def get_inventory(db: AsyncSession = Depends(get_db)):
    """Format JSON compatible Ansible dynamic inventory."""
    groups_result = await db.execute(select(Group).options(selectinload(Group.terminals)))
    groups = groups_result.scalars().all()

    terminals_result = await db.execute(select(Terminal).options(selectinload(Terminal.groups)))
    terminals = terminals_result.scalars().all()

    inventory: dict = {
        "_meta": {"hostvars": {}},
        "all": {"hosts": [], "children": []},
    }

    for terminal in terminals:
        inventory["_meta"]["hostvars"][terminal.hostname] = {
            "ansible_user": terminal.username,
            "ansible_port": terminal.port,
            "ansible_host": terminal.hostname,
        }

    for group in groups:
        inventory[group.name] = {"hosts": [t.hostname for t in group.terminals]}
        inventory["all"]["children"].append(group.name)

    return inventory
