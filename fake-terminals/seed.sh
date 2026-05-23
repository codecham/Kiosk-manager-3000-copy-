#!/bin/bash
# ============================================================
#  CPAS Manager 3000 — Seed des faux terminaux
#
#  Enregistre terminal-alpha, terminal-beta et terminal-gamma
#  dans la base de données via l'API d'enrollment automatique.
#
#  Usage :
#    ./fake-terminals/seed.sh
#    ./fake-terminals/seed.sh http://localhost:5173
# ============================================================

set -e

CONSOLE_URL="${1:-http://localhost}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin}"
FAKE_TERMINALS=("terminal-alpha" "terminal-beta" "terminal-gamma")

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${CYAN}[seed]${NC} $1"; }
log_success() { echo -e "${GREEN}[seed]${NC} ✅ $1"; }
log_warning() { echo -e "${YELLOW}[seed]${NC} ⚠️  $1"; }
log_error()   { echo -e "${RED}[seed]${NC} ❌ $1"; }

# ------------------------------------------------------------
#  1. Authentification — récupère le JWT admin
# ------------------------------------------------------------

log_info "Connexion à $CONSOLE_URL en tant que $ADMIN_USER..."

TOKEN=$(curl -sf -X POST "$CONSOLE_URL/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USER&password=$ADMIN_PASS" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || true)

if [ -z "$TOKEN" ]; then
    log_error "Échec de connexion — vérifiez que CPAS est démarré et que les credentials sont corrects"
    log_error "URL : $CONSOLE_URL | User : $ADMIN_USER"
    exit 1
fi

log_success "Authentifié"

# ------------------------------------------------------------
#  2. Récupère la clé d'enrollment permanente
# ------------------------------------------------------------

log_info "Récupération de la clé d'enrollment permanente..."

ENROLL_KEY=$(curl -sf "$CONSOLE_URL/api/enroll/permanent-key?console_url=$CONSOLE_URL" \
    -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['key'])" 2>/dev/null || true)

if [ -z "$ENROLL_KEY" ]; then
    log_error "Impossible de récupérer la clé d'enrollment"
    exit 1
fi

log_success "Clé d'enrollment récupérée"

# ------------------------------------------------------------
#  3. Enregistrement de chaque faux terminal
# ------------------------------------------------------------

SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for HOST in "${FAKE_TERMINALS[@]}"; do
    log_info "Enrollment de $HOST..."

    IP=$(docker compose exec "$HOST" hostname -I 2>/dev/null | awk '{print $1}' | tr -d '\r\n' || true)

    if [ -z "$IP" ]; then
        log_warning "$HOST — conteneur introuvable ou non démarré, ignoré"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    OS=$(docker compose exec "$HOST" lsb_release -ds 2>/dev/null | tr -d '\r\n' || echo "Ubuntu 24.04")
    MAC=$(docker compose exec "$HOST" ip link show eth0 2>/dev/null \
        | grep "link/ether" | awk '{print $2}' | tr -d '\r\n' || echo "N/A")

    RESPONSE=$(curl -sf -X POST "$CONSOLE_URL/api/enroll/auto" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"$ENROLL_KEY\",
            \"hostname\": \"$HOST\",
            \"ip\": \"$IP\",
            \"os_version\": \"$OS\",
            \"mac_address\": \"$MAC\",
            \"serial_number\": \"FAKE-$(echo $HOST | tr '[:lower:]' '[:upper:]')\"
        }" 2>/dev/null || true)

    if [ -z "$RESPONSE" ]; then
        log_error "$HOST — échec de l'enrollment (pas de réponse)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi

    MESSAGE=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',''))" 2>/dev/null || true)
    log_success "$HOST — $MESSAGE (IP: $IP)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
done

# ------------------------------------------------------------
#  4. Résumé
# ------------------------------------------------------------

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Enrollés  : $SUCCESS_COUNT${NC}"
[ "$SKIP_COUNT" -gt 0 ] && echo -e "  ${YELLOW}Ignorés   : $SKIP_COUNT${NC}"
[ "$FAIL_COUNT" -gt 0 ] && echo -e "  ${RED}Échoués   : $FAIL_COUNT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$FAIL_COUNT" -gt 0 ]; then
    echo ""
    log_warning "Certains enrollments ont échoué."
    log_warning "Vérifiez que les conteneurs sont bien démarrés : make ps"
    exit 1
fi

echo ""
log_success "Faux terminaux disponibles dans CPAS → $CONSOLE_URL"