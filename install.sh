#!/bin/bash

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update
sudo apt upgrade -y

# Instalar Node.js y npm
echo "Instalando Node.js y npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 globalmente
echo "Instalando PM2..."
sudo npm install -g pm2

# Instalar MongoDB
echo "Instalando MongoDB..."
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Instalar dependencias del proyecto
echo "Instalando dependencias del proyecto..."
npm install --production

# Iniciar la aplicación con PM2
echo "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js
pm2 save

# Configurar PM2 para iniciar con el sistema
echo "Configurando PM2 para iniciar con el sistema..."
pm2 startup

echo "¡Instalación completada!"
