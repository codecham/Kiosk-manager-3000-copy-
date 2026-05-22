# Terminal Console — Documentation

Console web de gestion de serveurs Linux avec intégration Ansible.

---

## Stack technique

| Composant | Technologie | Rôle |
|---|---|---|
| Backend | Python 3.12 + FastAPI | API REST, logique métier |
| Frontend | React 18 + Ant Design 5 | Interface web |
| Base de données | PostgreSQL 16 | Stockage des données |
| Queue | Redis 7 + Celery | Exécution Ansible en arrière-plan |
| SSH | Paramiko | Test de connexion et collecte infos système |
| Ansible | ansible-runner | Exécution des playbooks |
| Reverse proxy | Nginx | Sert le frontend + proxy vers l'API |
| Déploiement | Docker Compose | Orchestration des conteneurs |

---

## Installation

### Prérequis (VM Linux / WSL2)

```bash
# Installer Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2

# Ajouter son utilisateur au groupe docker (évite sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Première installation du projet

```bash
# Cloner ou copier le projet
cd ~/terminal-console

# Créer le fichier de configuration
cp .env.example .env
nano .env   # Modifier les mots de passe !

# Construire et démarrer tous les services
docker compose up -d --build
```

---

## Commandes Docker quotidiennes

```bash
# Voir l'état des services
docker compose ps

# Voir les logs d'un service en temps réel
docker compose logs -f backend
docker compose logs -f worker
docker compose logs -f frontend

# Redémarrer un service
docker compose restart backend

# Arrêter tous les services (conserve les données)
docker compose down

# Arrêter ET supprimer toutes les données (base de données incluse)
docker compose down -v

# Rebuilder et redémarrer après modification du code (OBLIGATOIRE pour que les changements soient pris en compte)
docker compose up -d --build

# ⚠️ "docker compose restart" NE recompile PAS l'image — n'utilise pas ça après un changement de code !

# Accéder au shell d'un conteneur
docker compose exec backend bash
docker compose exec postgres psql -U termconsole
```

---

## Synchronisation Windows ↔ WSL2

Le code est édité sous Windows (VS Code) et doit être synchronisé dans WSL2 pour Docker.

```bash
# Synchroniser tous les fichiers (depuis WSL2)
rsync -av /mnt/c/Users/Jo/terminal-console/ ~/terminal-console/ \
    --exclude node_modules --exclude __pycache__

# Puis rebuilder
docker compose up -d --build
```

---

## Configuration réseau (WSL2 → réseau local)

WSL2 tourne dans un réseau interne — ces commandes exposent la console sur le réseau local.
**À relancer à chaque redémarrage de Windows.**

```powershell
# Dans PowerShell en ADMINISTRATEUR

# 1. Récupérer l'IP interne de WSL2
$wslIp = (wsl hostname -I).Trim().Split()[0]
Write-Host "IP WSL2 : $wslIp"

# 2. Rediriger le port 80 de l'IP Windows vers WSL2
netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=$wslIp

# 3. Vérifier la règle
netsh interface portproxy show all

# 4. Autoriser le port 80 dans le firewall Windows (une seule fois)
New-NetFirewallRule -DisplayName "Terminal Console HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# 5. Autoriser le ping entrant (une seule fois)
New-NetFirewallRule -DisplayName "Allow ICMPv4" -Direction Inbound -Protocol ICMPv4 -Action Allow

# 6. Passer le réseau en profil Privé si nécessaire
Set-NetConnectionProfile -NetworkCategory Private
```

---

## Enrollment d'un terminal Linux

L'enrollment permet d'ajouter automatiquement un serveur Linux à la console.

### Côté console (navigateur)
1. Aller dans **Terminaux → Enroll un terminal**
2. Copier la commande affichée

### Côté serveur cible
```bash
# Coller et exécuter la commande générée par la console
curl -sSL "http://IP_CONSOLE/api/enroll/script?token=TOKEN&console_url=http://IP_CONSOLE" | sudo bash
```

Le script effectue automatiquement :
- Création de l'utilisateur `console`
- Configuration de l'accès SSH avec la clé de la console
- Enregistrement du terminal dans la base de données

### Prérequis sur le serveur cible
```bash
# SSH doit être installé et démarré
sudo apt install -y openssh-server
sudo systemctl enable --now ssh

# Si le firewall est actif, ouvrir le port 22
sudo ufw allow 22
```

### En cas de problème d'authentification SSH
La clé SSH de la console est regénérée si les volumes Docker sont supprimés (`down -v`).
Pour resynchroniser la clé sur un terminal déjà enrollé :

```bash
# Sur le serveur cible
curl http://IP_CONSOLE/api/enroll/pubkey | sudo tee /home/console/.ssh/authorized_keys
sudo chmod 600 /home/console/.ssh/authorized_keys
sudo chown console:console /home/console/.ssh/authorized_keys
```

---

## Playbooks Ansible

### Ajouter un playbook
Déposer le fichier `.yml` dans `ansible/playbooks/` — il apparaît automatiquement dans l'interface.

```bash
# Exemple : copier un playbook depuis Windows vers WSL2
cp /mnt/c/Users/Jo/mon_playbook.yml ~/terminal-console/ansible/playbooks/
```

### Inventaire dynamique (accès depuis la ligne de commande)
La console expose un inventaire Ansible compatible :

```bash
# Lister tous les hôtes de l'inventaire
curl http://localhost/api/inventory

# Utiliser l'inventaire depuis Ansible CLI
ansible -i http://localhost/api/inventory all -m ping
```

---

## Structure du projet

```
terminal-console/
├── docker-compose.yml          Orchestration des conteneurs
├── .env                        Configuration (mots de passe, secrets)
├── .env.example                Modèle de configuration
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt        Dépendances Python
│   └── app/
│       ├── main.py             Point d'entrée FastAPI
│       ├── config.py           Lecture de la configuration
│       ├── database.py         Connexion PostgreSQL
│       ├── models/             Modèles de base de données
│       │   ├── user.py         Utilisateurs de la console
│       │   ├── terminal.py     Serveurs gérés
│       │   ├── group.py        Groupes Ansible
│       │   ├── playbook_run.py Historique des exécutions
│       │   └── enroll_token.py Tokens d'enrollment
│       ├── routers/            Endpoints API
│       │   ├── auth.py         Login, JWT
│       │   ├── terminals.py    CRUD terminaux + SSH check
│       │   ├── groups.py       CRUD groupes
│       │   ├── playbooks.py    Lancement Ansible
│       │   ├── inventory.py    Inventaire dynamique
│       │   └── enroll.py       Enrollment automatique
│       ├── services/
│       │   ├── auth.py         Hachage mots de passe, JWT
│       │   ├── ssh.py          Test connexion SSH
│       │   ├── ansible.py      Exécution playbooks
│       │   ├── console_key.py  Clé SSH de la console
│       │   └── system_info.py  Collecte infos système via SSH
│       └── workers/
│           └── celery_app.py   Tâches asynchrones Ansible
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf              Config Nginx (SPA + proxy API)
│   └── src/
│       ├── App.jsx             Routes React
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Terminals.jsx
│       │   ├── TerminalDetail.jsx
│       │   ├── Groups.jsx
│       │   └── Playbooks.jsx
│       ├── components/
│       │   └── Layout.jsx      Menu + structure
│       └── services/
│           └── api.js          Appels API (axios)
└── ansible/
    └── playbooks/              Déposer les playbooks ici
        └── example_update.yml  Mise à jour apt
```

---

## Accès

| URL | Description |
|---|---|
| `http://IP_CONSOLE` | Interface web |
| `http://IP_CONSOLE/api/docs` | Documentation interactive de l'API (Swagger) |
| `http://IP_CONSOLE/api/health` | Health check |
| `http://IP_CONSOLE/api/inventory` | Inventaire dynamique Ansible |

**Compte par défaut :** `admin` / `admin` — **à changer en production !**
