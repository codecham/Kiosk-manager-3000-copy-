import io

import paramiko


def _run_command(client: paramiko.SSHClient, cmd: str) -> str:
    _, stdout, _ = client.exec_command(cmd, timeout=10)
    return stdout.read().decode().strip()


def collect_system_info(hostname: str, port: int, username: str, ssh_key: str) -> dict:
    """Se connecte en SSH et collecte les infos système du terminal."""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        key = paramiko.RSAKey.from_private_key(io.StringIO(ssh_key))
        client.connect(hostname=hostname, port=port, username=username, pkey=key, timeout=10)

        info = {
            "hostname": _run_command(client, "hostname"),
            "os": _run_command(client, "lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '\"'"),
            "kernel": _run_command(client, "uname -r"),
            "cpu_model": _run_command(client, "grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2 | sed 's/^ *//'"),
            "cpu_cores": _run_command(client, "nproc"),
            "ram_total": _run_command(client, "grep MemTotal /proc/meminfo | awk '{print $2}'"),
            "ram_available": _run_command(client, "grep MemAvailable /proc/meminfo | awk '{print $2}'"),
            "disk_total": _run_command(client, "df -h / | tail -1 | awk '{print $2}'"),
            "disk_used": _run_command(client, "df -h / | tail -1 | awk '{print $3}'"),
            "disk_percent": _run_command(client, "df / | tail -1 | awk '{print $5}'"),
            "uptime": _run_command(client, "uptime -p"),
            "last_boot": _run_command(client, "who -b | awk '{print $3, $4}'"),
            "ip_addresses": _run_command(client, "hostname -I"),
            "arch": _run_command(client, "uname -m"),
            "load_avg": _run_command(client, "cat /proc/loadavg | awk '{print $1, $2, $3}'"),
        }

        # Convertir RAM en Mo
        try:
            info["ram_total_mb"] = round(int(info["ram_total"]) / 1024)
            info["ram_used_mb"] = round((int(info["ram_total"]) - int(info["ram_available"])) / 1024)
        except (ValueError, ZeroDivisionError):
            info["ram_total_mb"] = 0
            info["ram_used_mb"] = 0

        return {"success": True, "info": info}

    except paramiko.AuthenticationException:
        return {"success": False, "error": "Échec d'authentification SSH"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        client.close()
