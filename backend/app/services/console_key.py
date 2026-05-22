import io
import os

import paramiko

KEY_PATH = "/app/ssh_keys/console.key"
PUB_PATH = "/app/ssh_keys/console.pub"


def get_or_create_console_key() -> tuple[str, str]:
    """Retourne (private_key, public_key) de l'identité SSH de la console."""
    if os.path.exists(KEY_PATH) and os.path.exists(PUB_PATH):
        with open(KEY_PATH) as f:
            private_key = f.read()
        with open(PUB_PATH) as f:
            public_key = f.read()
        return private_key, public_key

    key = paramiko.RSAKey.generate(4096)

    buf = io.StringIO()
    key.write_private_key(buf)
    private_key = buf.getvalue()
    public_key = f"ssh-rsa {key.get_base64()} console@terminal-console"

    os.makedirs("/app/ssh_keys", exist_ok=True)
    with open(KEY_PATH, "w") as f:
        f.write(private_key)
    os.chmod(KEY_PATH, 0o600)
    with open(PUB_PATH, "w") as f:
        f.write(public_key)

    return private_key, public_key


def get_public_key() -> str:
    return get_or_create_console_key()[1]


def get_private_key() -> str:
    return get_or_create_console_key()[0]
