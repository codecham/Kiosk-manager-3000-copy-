import io

import paramiko


def test_ssh_connection(hostname: str, port: int, username: str, ssh_key: str) -> tuple[bool, str]:
    """Teste la connexion SSH vers un terminal. Retourne (success, message)."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        key = paramiko.RSAKey.from_private_key(io.StringIO(ssh_key))
        client.connect(hostname=hostname, port=port, username=username, pkey=key, timeout=10)
        client.close()
        return True, "Connexion SSH réussie"
    except paramiko.AuthenticationException:
        return False, "Échec d'authentification SSH"
    except paramiko.SSHException as e:
        return False, f"Erreur SSH : {e}"
    except Exception as e:
        return False, f"Impossible de joindre {hostname}:{port} — {e}"
    finally:
        client.close()
