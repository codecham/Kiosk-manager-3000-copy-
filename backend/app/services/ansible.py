import os

import ansible_runner

from app.config import settings


def run_playbook(
    playbook_path: str,
    inventory: dict,
    extra_vars: dict | None = None,
) -> tuple[str, bool]:
    """Lance un playbook Ansible et retourne (output, success)."""
    playbooks_dir = os.path.join(settings.ansible_base_path, "playbooks")
    result = ansible_runner.run(
        playbook=playbook_path,
        inventory=inventory,
        extravars=extra_vars or {},
        private_data_dir=settings.ansible_base_path,
        project_dir=playbooks_dir,
        quiet=False,
    )
    output = "\n".join(str(e) for e in result.events if e.get("stdout"))
    success = result.rc == 0
    return output, success


def list_playbooks() -> list[str]:
    """Liste les fichiers .yml dans le dossier playbooks."""
    playbooks_dir = os.path.join(settings.ansible_base_path, "playbooks")
    if not os.path.isdir(playbooks_dir):
        return []
    return [f for f in os.listdir(playbooks_dir) if f.endswith((".yml", ".yaml"))]
