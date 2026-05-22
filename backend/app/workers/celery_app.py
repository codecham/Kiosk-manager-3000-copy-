import asyncio
import uuid as uuid_module
from datetime import datetime, timezone

from celery import Celery

from app.config import settings

celery = Celery("cpas_manager", broker=settings.redis_url, backend=settings.redis_url)
celery.conf.task_serializer = "json"


@celery.task(bind=True)
def run_playbook_task(self, run_id: str, playbook_path: str, inventory: dict, extra_vars: dict):
    """Exécute un playbook Ansible et met à jour la DB. Retire le tag Unconfigured si succès."""
    from app.database import AsyncSessionLocal
    from app.models.playbook_run import PlaybookRun, RunStatus
    from app.services.ansible import run_playbook

    async def _execute():
        async with AsyncSessionLocal() as db:
            run = await db.get(PlaybookRun, run_id)
            if not run:
                return

            run.status = RunStatus.running
            run.started_at = datetime.now(timezone.utc)
            await db.commit()

            output, success = run_playbook(playbook_path, inventory, extra_vars)

            run.output = output
            run.status = RunStatus.success if success else RunStatus.failed
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()

            if success and (run.target_groups or run.target_hosts):
                await _remove_unconfigured_tag(db, run)

    async def _remove_unconfigured_tag(db, run):
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.group import Group, terminal_group
        from app.models.terminal import Terminal

        group_result = await db.execute(select(Group).where(Group.name == "Unconfigured"))
        unconfigured = group_result.scalar_one_or_none()
        if not unconfigured:
            return

        terminal_ids = set()

        if run.target_groups:
            target_result = await db.execute(
                select(Group)
                .where(Group.name.in_(run.target_groups))
                .options(selectinload(Group.terminals))
            )
            for group in target_result.scalars().all():
                for terminal in group.terminals:
                    terminal_ids.add(terminal.id)

        if run.target_hosts:
            for h in run.target_hosts:
                try:
                    terminal_ids.add(uuid_module.UUID(h))
                except (ValueError, AttributeError):
                    pass

        if terminal_ids:
            await db.execute(
                terminal_group.delete().where(
                    terminal_group.c.terminal_id.in_(list(terminal_ids)),
                    terminal_group.c.group_id == unconfigured.id,
                )
            )
            await db.commit()

    asyncio.run(_execute())
