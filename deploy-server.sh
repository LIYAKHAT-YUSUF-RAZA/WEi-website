#!/bin/bash

# WEintegrity Server Deployment Script
# Run this script after uploading files to server

set -e

echo "🚀 Starting WEintegrity Deployment on Server..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/weintegrity"

# Check if we're in the right directory
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}Error: Not in correct directory. Please cd to /var/www/weintegrity${NC}"
    exit 1
fi

cd $PROJECT_DIR

# Step 1: Check .env file
echo -e "${YELLOW}Step 1: Checking environment configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}Error: backend/.env file not found!${NC}"
    echo "Please create it from backend/.env.production and update with your values"
    exit 1
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

# Step 2: Install backend dependencies
echo -e "${YELLOW}Step 2: Installing backend dependencies...${NC}"
cd backend
npm install --production
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Step 3: Install frontend dependencies and build
echo -e "${YELLOW}Step 3: Installing frontend dependencies...${NC}"
cd ../frontend
npm install

echo -e "${YELLOW}Step 4: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Step 4: Configure Nginx
echo -e "${YELLOW}Step 5: Configuring Nginx...${NC}"
cd ..
sudo cp nginx.conf /etc/nginx/sites-available/weintegrity

# Create symlink if doesn't exist
if [ ! -L "/etc/nginx/sites-enabled/weintegrity" ]; then
    sudo ln -s /etc/nginx/sites-available/weintegrity /etc/nginx/sites-enabled/
fi

# Test nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
    sudo systemctl reload nginx
else
    echo -e "${RED}❌ Nginx configuration error. Please check the config.${NC}"
    exit 1
fi

# Step 5: Setup systemd service
echo -e "${YELLOW}Step 6: Setting up backend service...${NC}"
sudo cp weintegrity.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable weintegrity
sudo systemctl restart weintegrity

sleep 2

# Check service status
if sudo systemctl is-active --quiet weintegrity; then
    echo -e "${GREEN}✅ Backend service is running${NC}"
else
    echo -e "${RED}❌ Backend service failed to start. Checking logs...${NC}"
    sudo journalctl -u weintegrity -n 50
    exit 1
fi

# Step 6: Setup SSL
echo -e "${YELLOW}Step 7: SSL Setup${NC}"
echo "To setup SSL certificate, run:"
echo -e "${GREEN}sudo certbot --nginx -d dev.weintegrity.com${NC}"
echo ""
echo "After SSL is configured, uncomment SSL lines in /etc/nginx/sites-available/weintegrity"
echo "Then run: sudo systemctl reload nginx"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 Your website should be accessible at:"
echo "   http://dev.weintegrity.com (before SSL)"
echo "   https://dev.weintegrity.com (after SSL)"
echo ""
echo "📊 Check status:"
echo "   Backend: sudo systemctl status weintegrity"
echo "   Nginx: sudo systemctl status nginx"
echo ""
echo "📝 View logs:"
echo "   Backend: sudo journalctl -u weintegrity -f"
echo "   Nginx: sudo tail -f /var/log/nginx/weintegrity_error.log"
