#!/bin/bash
set -e

CONSOLE_URL="${CONSOLE_URL:-http://backend:8000}"
MAX_RETRIES=30
RETRY=0

echo "[fake-terminal] $(hostname) — démarrage"
echo "[fake-terminal] En attente du backend ($CONSOLE_URL)..."

# Attend que le backend soit prêt ET que la clé SSH soit disponible
until curl -sf --max-time 3 "$CONSOLE_URL/api/enroll/pubkey" \
        > /home/console/.ssh/authorized_keys 2>/dev/null; do

    RETRY=$((RETRY + 1))
    if [ "$RETRY" -ge "$MAX_RETRIES" ]; then
        echo "[fake-terminal] ❌ Timeout après $MAX_RETRIES tentatives — clé publique inaccessible"
        exit 1
    fi

    echo "[fake-terminal] Tentative $RETRY/$MAX_RETRIES..."
    sleep 2
done

chmod 600 /home/console/.ssh/authorized_keys
chown console:console /home/console/.ssh/authorized_keys

echo "[fake-terminal] ✅ Clé SSH installée — démarrage sshd"

exec /usr/sbin/sshd -D -e