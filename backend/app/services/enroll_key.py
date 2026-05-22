import secrets
from pathlib import Path

_KEY_PATH = Path("/app/ssh_keys/enroll.key")


def get_enroll_key() -> str:
    if not _KEY_PATH.exists():
        _KEY_PATH.parent.mkdir(parents=True, exist_ok=True)
        _KEY_PATH.write_text(secrets.token_urlsafe(32))
    return _KEY_PATH.read_text().strip()


def rotate_enroll_key() -> str:
    key = secrets.token_urlsafe(32)
    _KEY_PATH.write_text(key)
    return key
