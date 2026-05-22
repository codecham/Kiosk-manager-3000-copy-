# Démarrage — Terminal Console

## Prérequis sur la VM Linux
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER  # puis se reconnecter
```

## Première installation
```bash
git clone <url-du-projet> terminal-console
cd terminal-console

# Copier et configurer l'environnement
cp .env.example .env
nano .env  # changer les mots de passe !

# Construire et démarrer
docker compose up -d --build
```

## Accès
- Console web : http://IP_DE_LA_VM
- API docs : http://IP_DE_LA_VM/api/docs
- Login par défaut : admin / admin  ← CHANGER EN PRODUCTION

## Commandes utiles
```bash
docker compose logs -f backend    # logs du backend
docker compose logs -f worker     # logs Celery (Ansible)
docker compose ps                 # état des services
docker compose restart backend    # redémarrer un service
docker compose down               # arrêter tout
```

## Ajouter un playbook Ansible
Déposer le fichier .yml dans `ansible/playbooks/` et il apparaît automatiquement dans l'interface.

## Inventaire dynamique Ansible (depuis la ligne de commande)
```bash
ansible -i http://localhost/api/inventory all -m ping
```
