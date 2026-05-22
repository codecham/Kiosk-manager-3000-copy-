import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.enroll_token import EnrollToken
from app.models.group import Group, terminal_group
from app.models.terminal import Terminal, TerminalStatus
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.console_key import get_private_key, get_public_key

router = APIRouter(prefix="/enroll", tags=["enroll"])

ENROLL_USER = "console"
TOKEN_VALIDITY_HOURS = 2


def _make_terminal_name(hostname: str, mac_address: str | None) -> str:
    if mac_address and mac_address not in ("N/A", "", None):
        return f"CPAS-{mac_address.replace(':', '').upper()}"
    return hostname

ENROLL_SCRIPT = """\
#!/bin/bash
set -e

CONSOLE_URL="PLACEHOLDER_URL"
CONSOLE_TOKEN="PLACEHOLDER_TOKEN"
CONSOLE_USER="console"

echo "=== CPAS Manager 3000 — Enrollment ==="

if ! id "$CONSOLE_USER" &>/dev/null; then
    echo "[1/4] Création de l'utilisateur $CONSOLE_USER..."
    useradd -m -s /bin/bash "$CONSOLE_USER"
else
    echo "[1/4] Utilisateur $CONSOLE_USER déjà existant."
fi

echo "[2/4] Configuration SSH..."
mkdir -p /home/$CONSOLE_USER/.ssh
chmod 700 /home/$CONSOLE_USER/.ssh
PUBKEY=$(curl -sSfL "$CONSOLE_URL/api/enroll/pubkey")
echo "$PUBKEY" > /home/$CONSOLE_USER/.ssh/authorized_keys
chmod 600 /home/$CONSOLE_USER/.ssh/authorized_keys
chown -R $CONSOLE_USER:$CONSOLE_USER /home/$CONSOLE_USER/.ssh

echo "[3/4] Collecte des informations système..."
HOSTNAME=$(hostname)
IP=$(hostname -I | awk '{print $1}')
OS_VERSION=$(lsb_release -ds 2>/dev/null || grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')
MAC=$(ip link show | grep -v "lo:" | grep "ether" | head -1 | awk '{print $2}')
SERIAL=$(dmidecode -s system-serial-number 2>/dev/null | grep -v "^#" | head -1 | tr -d '\\n ' || echo "N/A")

echo "[4/4] Enregistrement auprès de CPAS Manager 3000..."
curl -sSfL -X POST "$CONSOLE_URL/api/enroll/complete" \\
    -H "Content-Type: application/json" \\
    -d "{\\"token\\": \\"$CONSOLE_TOKEN\\", \\"hostname\\": \\"$HOSTNAME\\", \\"ip\\": \\"$IP\\", \\"os_version\\": \\"$OS_VERSION\\", \\"mac_address\\": \\"$MAC\\", \\"serial_number\\": \\"$SERIAL\\"}"

echo ""
echo "=== Enrollment terminé ! Ce terminal est visible dans CPAS Manager 3000. ==="
"""

ENROLL_AUTO_SCRIPT = """\
#!/bin/bash
set -e

CONSOLE_URL="PLACEHOLDER_URL"
ENROLL_KEY="PLACEHOLDER_KEY"
CONSOLE_USER="console"

echo "=== CPAS Manager 3000 — Enrollment automatique ==="

if ! id "$CONSOLE_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$CONSOLE_USER"
fi

mkdir -p /home/$CONSOLE_USER/.ssh
chmod 700 /home/$CONSOLE_USER/.ssh
curl -sSfL "$CONSOLE_URL/api/enroll/pubkey" > /home/$CONSOLE_USER/.ssh/authorized_keys
chmod 600 /home/$CONSOLE_USER/.ssh/authorized_keys
chown -R $CONSOLE_USER:$CONSOLE_USER /home/$CONSOLE_USER/.ssh

HOSTNAME=$(hostname)
IP=$(hostname -I | awk '{print $1}')
OS_VERSION=$(lsb_release -ds 2>/dev/null || grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')
MAC=$(ip link show | grep -v "lo:" | grep "ether" | head -1 | awk '{print $2}')
SERIAL=$(dmidecode -s system-serial-number 2>/dev/null | grep -v "^#" | head -1 | tr -d '\\n ' || echo "N/A")

curl -sSfL -X POST "$CONSOLE_URL/api/enroll/auto" \\
    -H "Content-Type: application/json" \\
    -d "{\\"key\\": \\"$ENROLL_KEY\\", \\"hostname\\": \\"$HOSTNAME\\", \\"ip\\": \\"$IP\\", \\"os_version\\": \\"$OS_VERSION\\", \\"mac_address\\": \\"$MAC\\", \\"serial_number\\": \\"$SERIAL\\"}"

echo "=== Enrollment automatique terminé ==="
"""


class TokenOut(BaseModel):
    token: str
    expires_at: str
    command: str


class PermanentKeyOut(BaseModel):
    key: str
    command: str


class EnrollComplete(BaseModel):
    token: str
    hostname: str
    ip: str
    os_version: str | None = None
    mac_address: str | None = None
    serial_number: str | None = None


class AutoEnrollData(BaseModel):
    key: str
    hostname: str
    ip: str
    os_version: str | None = None
    mac_address: str | None = None
    serial_number: str | None = None


@router.post("/token", response_model=TokenOut)
async def create_enroll_token(
    console_url: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    token_value = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_VALIDITY_HOURS)

    token = EnrollToken(token=token_value, expires_at=expires_at, created_by=current_user.id)
    db.add(token)
    await db.commit()

    command = f'curl -sSL "{console_url}/api/enroll/script?token={token_value}&console_url={console_url}" | sudo bash'
    return TokenOut(token=token_value, expires_at=expires_at.isoformat(), command=command)


@router.get("/permanent-key", response_model=PermanentKeyOut)
async def get_permanent_enroll_key(console_url: str, _=Depends(get_current_user)):
    from app.services.enroll_key import get_enroll_key
    key = get_enroll_key()
    command = f'curl -sSL "{console_url}/api/enroll/auto-script?key={key}&console_url={console_url}" | sudo bash'
    return PermanentKeyOut(key=key, command=command)


@router.post("/rotate-key")
async def rotate_permanent_key(_=Depends(get_current_user)):
    from app.services.enroll_key import rotate_enroll_key
    return {"key": rotate_enroll_key(), "message": "Clé rotée — mettez à jour vos images ISO"}


@router.get("/pubkey", response_class=PlainTextResponse)
async def get_console_pubkey():
    return get_public_key()


@router.get("/script", response_class=PlainTextResponse)
async def get_enroll_script(token: str, console_url: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnrollToken).where(EnrollToken.token == token))
    enroll_token = result.scalar_one_or_none()

    if not enroll_token or enroll_token.used:
        raise HTTPException(status_code=404, detail="Token invalide ou déjà utilisé")
    if enroll_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Token expiré")

    script = ENROLL_SCRIPT.replace("PLACEHOLDER_URL", console_url).replace("PLACEHOLDER_TOKEN", token)
    return script


@router.get("/auto-script", response_class=PlainTextResponse)
async def get_auto_enroll_script(key: str, console_url: str):
    from app.services.enroll_key import get_enroll_key
    if key != get_enroll_key():
        raise HTTPException(status_code=403, detail="Clé invalide")
    return ENROLL_AUTO_SCRIPT.replace("PLACEHOLDER_URL", console_url).replace("PLACEHOLDER_KEY", key)


async def _find_or_create_unconfigured_group(db: AsyncSession) -> Group:
    result = await db.execute(select(Group).where(Group.name == "Unconfigured"))
    group = result.scalar_one_or_none()
    if not group:
        group = Group(name="Unconfigured", description="Terminaux nouvellement enrollés — en attente de configuration")
        db.add(group)
        await db.flush()
    return group


async def _create_and_register_terminal(
    hostname: str, ip: str, os_version: str | None, mac_address: str | None, serial_number: str | None,
    db: AsyncSession,
) -> Terminal:
    terminal = Terminal(
        name=_make_terminal_name(hostname, mac_address),
        hostname=ip,
        username=ENROLL_USER,
        ssh_key=get_private_key(),
        os_version=os_version,
        mac_address=mac_address,
        serial_number=serial_number,
        description=os_version,
        status=TerminalStatus.unknown,
    )
    db.add(terminal)
    await db.flush()
    unconfigured = await _find_or_create_unconfigured_group(db)
    await db.execute(terminal_group.insert().values(terminal_id=terminal.id, group_id=unconfigured.id))
    return terminal


@router.post("/complete")
async def complete_enrollment(data: EnrollComplete, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EnrollToken).where(EnrollToken.token == data.token))
    enroll_token = result.scalar_one_or_none()

    if not enroll_token or enroll_token.used:
        raise HTTPException(status_code=404, detail="Token invalide ou déjà utilisé")
    if enroll_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Token expiré")

    terminal = await _create_and_register_terminal(
        data.hostname, data.ip, data.os_version, data.mac_address, data.serial_number, db
    )
    enroll_token.used = True
    enroll_token.terminal_id = terminal.id
    await db.commit()

    return {"success": True, "terminal_id": str(terminal.id), "message": f"Terminal {terminal.name} enregistré"}


@router.post("/auto")
async def auto_enroll(data: AutoEnrollData, db: AsyncSession = Depends(get_db)):
    from app.services.enroll_key import get_enroll_key
    if data.key != get_enroll_key():
        raise HTTPException(status_code=403, detail="Clé d'enrollment invalide")

    if data.mac_address:
        result = await db.execute(select(Terminal).where(Terminal.mac_address == data.mac_address))
        existing = result.scalar_one_or_none()
        if existing:
            existing.hostname = data.ip
            if data.os_version:
                existing.os_version = data.os_version
            if data.serial_number:
                existing.serial_number = data.serial_number
            await db.commit()
            return {"success": True, "terminal_id": str(existing.id), "message": f"Terminal {data.hostname} mis à jour"}

    terminal = await _create_and_register_terminal(
        data.hostname, data.ip, data.os_version, data.mac_address, data.serial_number, db
    )
    await db.commit()

    return {"success": True, "terminal_id": str(terminal.id), "message": f"Terminal {terminal.name} enregistré"}
