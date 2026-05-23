# kiosk-manager-3000

## Windows WSL setup:

Comme tu fais tourner le code dans WSL, au lieu de coder sur windows et de devoir sync à chaque fois tes fichiers avec le dossier sur WSL, il faut ouvrir VScode directement dans WSL. Cela te permet de travailler directement sur le code de ton projet et d'utiliser uniquement les commandes linux.
Voici comment setup l'environement pour travailler sur WSL.

1) Installer l'extension WSL depuis les extension de VSCode.
2) Se connecter à WSL
3) Ajouter la variable d'environement à bashrc (remplacer USER_NAME par le nom d'utilisateur Windows ):
```echo 'export PATH="$PATH:/mnt/c/Users/[USER_NAME]/AppData/Local/Programs/Microsoft VS Code/bin"' >> ~/.bashrc```
4) Recharger pour appliquer le changement:
```source bashrc```
5) Se déplacer dans le home de wsl:
```cd /home```
6) Clone le repo git:
```git clone https://github.com/Jolandelacroix/kiosk-manager-3000.git kiosk_manager```
7) Se déplacer dans le dossier du repo:
```cd kiosk_manager```
8) Ouvrir ce dossier dans VScode:
```code .```
9) Appuyer sur le petit bouton en bas à gauche de VSCode: WSL


## Setup l'environement:
Il faut installer les lib npm et gérer l'environnement python.

### Frontend
1) ```sudo apt-get install curl```
2) ```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash```
3) ```cd frontend```
4) ```npm install```


### Backend
1) ```sudo apt install python3```
2) ```sudo apt install python3-pip python3-venv```
3) ```cd backend```
4) ```python -m venv venv```
5) ```source venv/bin/activate```
6) ```pip install -r requirements.txt```


## Lancer le projet:
1) Si ce n'est pas fait copier le .env.exemple en .env:
```cp .env.exemple .env```
Remplace les variable d'environement si besoin

2) Build le projet docker: 
```docker compose --build```

3) Run le projet:
```docker compose up```

4) Aller sur localhost:5173

J'ai ajouté le hot reload sur tes containers front et back. Donc maintenant, dès qu'il y a une modification de code, docker le detecte et recharge automatiquement, tu ne dois plus relancer des build. 

## 🛠️ Commandes Makefile
Pour facileter la vie j'ai fais un Makefile. Tu peux utiliser make [COMMAND_NAME]:

> Lancer `make` sans argument pour afficher l'aide complète.

### Démarrage & arrêt

| Commande | Description |
|---|---|
| `make dev` | Build les images **et** démarre tous les services |
| `make up` | Démarre les services sans rebuild (redémarrage rapide) |
| `make stop` | Stoppe les services sans les supprimer |
| `make down` | Arrête et supprime les conteneurs (données conservées) |
| `make restart` | Redémarre tous les services sans rebuild |

### Build & reset

| Commande | Description |
|---|---|
| `make build` | Build toutes les images sans démarrer |
| `make prod` | Démarre en mode production (`docker-compose.prod.yml`) |
| `make clean` | ⚠️ Arrête tout et supprime les volumes (efface la BDD) |
| `make reset` | ⚠️ `clean` + `dev` — repart de zéro |

### Logs

| Commande | Description |
|---|---|
| `make logs` | Logs en live de tous les services |
| `make logs-backend` | Logs du backend FastAPI |
| `make logs-worker` | Logs du worker Celery / Ansible |
| `make logs-frontend` | Logs du frontend Vite |
| `make logs-db` | Logs de PostgreSQL |

### État & santé

| Commande | Description |
|---|---|
| `make ps` | État de tous les conteneurs |
| `make health` | Ping sur `/api/health` pour vérifier le backend |

### Shells interactifs

| Commande | Description |
|---|---|
| `make shell-backend` | Shell bash dans le conteneur backend |
| `make shell-worker` | Shell bash dans le conteneur worker |
| `make shell-db` | `psql` dans le conteneur PostgreSQL |
| `make shell-redis` | `redis-cli` dans le conteneur Redis |

### Base de données

| Commande | Description |
|---|---|
| `make db-backup` | Sauvegarde la BDD dans `./backup.sql` |
| `make db-restore` | ⚠️ Restaure la BDD depuis `./backup.sql` (écrase les données) |

### Environnement

| Commande | Description |
|---|---|
| `make env` | Crée `.env` depuis `.env.example` si absent |


