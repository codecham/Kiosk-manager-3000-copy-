FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openssh-server \
    curl \
    python3 \
    lsb-release \
    iproute2 \
    procps \
    dmidecode \
    htop \
    vim \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Crée l'utilisateur "console" attendu par CPAS
RUN useradd -m -s /bin/bash console && \
    mkdir -p /home/console/.ssh && \
    chmod 700 /home/console/.ssh && \
    chown console:console /home/console/.ssh

# Config SSH : clé publique uniquement, pas de mot de passe
RUN mkdir /var/run/sshd && \
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && \
    sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && \
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config && \
    echo "StrictModes no" >> /etc/ssh/sshd_config

# Génère les clés hôtes SSH au build pour éviter un délai au démarrage
RUN ssh-keygen -A

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 22

ENTRYPOINT ["/entrypoint.sh"]