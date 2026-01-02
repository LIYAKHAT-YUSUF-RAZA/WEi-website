#!/bin/bash

# WEintegrity Deployment Script
# Run this script on your server after initial setup

set -e

echo "🚀 Starting WEintegrity Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/weintegrity"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${YELLOW}📦 Installing/Updating dependencies...${NC}"

# Backend dependencies
cd $BACKEND_DIR
npm install --production

# Frontend dependencies and build
cd $FRONTEND_DIR
npm install
npm run build

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Restart backend service
echo -e "${YELLOW}🔄 Restarting backend service...${NC}"
sudo systemctl restart weintegrity
sudo systemctl status weintegrity --no-pager

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your site should now be live at https://dev.weintegrity.com${NC}"
