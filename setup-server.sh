#!/bin/bash

# WEintegrity Server Setup Script
# Run this script on your server as the deployment user

echo "🚀 WEintegrity Server Setup Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as your deployment user.${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo -e "${GREEN}Node.js already installed: $(node -v)${NC}"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt install -y nginx
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Install Certbot for SSL
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# Create project directory
echo -e "${YELLOW}Creating project directory...${NC}"
sudo mkdir -p /var/www/weintegrity
sudo chown -R $USER:$USER /var/www/weintegrity

# Create logs directory
mkdir -p /var/www/weintegrity/logs

echo -e "${GREEN}✅ Server setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload your project files to /var/www/weintegrity"
echo "2. Run the deployment script: cd /var/www/weintegrity && ./deploy-server.sh"
