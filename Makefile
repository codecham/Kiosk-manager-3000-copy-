# ============================================================
#  CPAS Manager 3000 — Makefile
# ============================================================
include .env
export

COMPOSE  = docker compose
BACKEND  = backend
WORKER   = worker
FRONTEND = frontend
DB       = postgres
COMPOSE_WITH_TERMINALS = $(COMPOSE) -f docker-compose.yml -f fake-terminals/docker-compose.override.yml
CONSOLE_URL   := http://localhost:$(FRONTEND_PORT)

.DEFAULT_GOAL := help

# ------------------------------------------------------------
#  Aide
# ------------------------------------------------------------

.PHONY: help
help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ------------------------------------------------------------
#  Démarrage / arrêt
# ------------------------------------------------------------

.PHONY: up
up: ## Démarrer tous les services (sans rebuild)
	$(COMPOSE) up -d

.PHONY: down
down: ## Arrêter tous les services (données conservées)
	$(COMPOSE) down

.PHONY: restart
restart: ## Redémarrer tous les services (sans rebuild)
	$(COMPOSE) restart

.PHONY: stop
stop: ## Stopper tous les services sans les supprimer
	$(COMPOSE) stop

# ------------------------------------------------------------
#  Build & rebuild
# ------------------------------------------------------------

.PHONY: build
build: ## Builder toutes les images sans démarrer
	$(COMPOSE) build

.PHONY: dev
dev: ## Builder et démarrer en mode développement (hot-reload)
	$(COMPOSE) up -d --build

.PHONY: prod
prod: ## Démarrer en mode production (build optimisé)
	$(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# ------------------------------------------------------------
#  Reset
# ------------------------------------------------------------

.PHONY: clean
clean: ## Arrêter et supprimer les conteneurs + volumes (⚠️ efface la BDD)
	$(COMPOSE) down -v

.PHONY: reset
reset: clean dev ## Reset complet : clean + rebuild + redémarrage

# ------------------------------------------------------------
#  Logs
# ------------------------------------------------------------

.PHONY: logs
logs: ## Afficher les logs de tous les services (live)
	$(COMPOSE) logs -f

.PHONY: logs-backend
logs-backend: ## Logs du backend FastAPI (live)
	$(COMPOSE) logs -f $(BACKEND)

.PHONY: logs-worker
logs-worker: ## Logs du worker Celery / Ansible (live)
	$(COMPOSE) logs -f $(WORKER)

.PHONY: logs-frontend
logs-frontend: ## Logs du frontend Vite (live)
	$(COMPOSE) logs -f $(FRONTEND)

.PHONY: logs-db
logs-db: ## Logs de PostgreSQL (live)
	$(COMPOSE) logs -f $(DB)

# ------------------------------------------------------------
#  État & santé
# ------------------------------------------------------------

.PHONY: ps
ps: ## État des conteneurs
	$(COMPOSE) ps

.PHONY: health
health: ## Vérifier la santé de l'API backend
	@curl -sf http://localhost/api/health && echo "✅  Backend OK" || echo "❌  Backend inaccessible"

# ------------------------------------------------------------
#  Shells interactifs
# ------------------------------------------------------------

.PHONY: shell-backend
shell-backend: ## Ouvrir un shell dans le conteneur backend
	$(COMPOSE) exec $(BACKEND) bash

.PHONY: shell-frontend
shell-fronted: ## Ouvrir un shell dans le conteneur frontend
	$(COMPOSE) exec $(FRONTEND) bash

.PHONY: shell-worker
shell-worker: ## Ouvrir un shell dans le conteneur worker
	$(COMPOSE) exec $(WORKER) bash

.PHONY: shell-db
shell-db: ## Ouvrir psql dans le conteneur PostgreSQL
	$(COMPOSE) exec $(DB) psql -U $${POSTGRES_USER:-termconsole}

.PHONY: shell-redis
shell-redis: ## Ouvrir redis-cli dans le conteneur Redis
	$(COMPOSE) exec redis redis-cli

# ------------------------------------------------------------
#  Base de données
# ------------------------------------------------------------

.PHONY: db-backup
db-backup: ## Sauvegarder la base de données dans ./backup.sql
	$(COMPOSE) exec $(DB) pg_dump -U $${POSTGRES_USER:-termconsole} $${POSTGRES_DB:-termconsole} > backup.sql
	@echo "✅  Sauvegarde → backup.sql"

.PHONY: db-restore
db-restore: ## Restaurer la BDD depuis ./backup.sql (⚠️ écrase les données)
	$(COMPOSE) exec -T $(DB) psql -U $${POSTGRES_USER:-termconsole} $${POSTGRES_DB:-termconsole} < backup.sql
	@echo "✅  Restauration terminée"

# ------------------------------------------------------------
#  Environnement
# ------------------------------------------------------------

.PHONY: env
env: ## Créer le fichier .env depuis .env.example (si absent)
	@test -f .env && echo "⚠️  .env existe déjà — aucune action." || (cp .env.example .env && echo "✅  .env créé. Pense à modifier les mots de passe !")

# ------------------------------------------------------------
#  Faux terminaux de test
# ------------------------------------------------------------
 
.PHONY: dev-with-terminals
dev-with-terminals: ## 🖥️  Démarre tout + faux terminaux + enrollment automatique
	$(COMPOSE_WITH_TERMINALS) up -d --build
	@echo "⏳  Attente que les faux terminaux soient prêts..."
	@sleep 8
	@bash fake-terminals/seed.sh $(CONSOLE_URL)
 
.PHONY: seed-terminals
seed-terminals: ## Enregistre les faux terminaux dans CPAS (si déjà démarrés)
	@bash fake-terminals/seed.sh $(CONSOLE_URL)
 
.PHONY: logs-terminals
logs-terminals: ## Logs des faux terminaux (live)
	$(COMPOSE) logs -f terminal-alpha terminal-beta terminal-gamma
 
.PHONY: reset-with-terminals
reset-with-terminals: ## ⚠️  Reset complet + redémarre avec les faux terminaux
	$(MAKE) clean
	$(MAKE) dev-with-terminals

.PHONY: stop-terminals
stop-terminals: ## Arrête uniquement les faux terminaux de test
	$(COMPOSE_WITH_TERMINALS) stop terminal-alpha terminal-beta terminal-gamma

.PHONY: down-terminals
down-terminals: ## Supprime uniquement les faux terminaux de test
	$(COMPOSE_WITH_TERMINALS) rm -sf terminal-alpha terminal-beta terminal-gamma