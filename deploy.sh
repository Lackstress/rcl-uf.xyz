#!/bin/bash

# RCL League Website - VM Deployment Script
# This script deploys the website on a Linux VM

set -e

echo "🏈 RCL League Website Deployment"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check Node version
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
npm run build

# Check if nginx is installed, if not install it
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Create nginx config for the site
SITE_NAME="rcl-uf.xyz"
NGINX_CONFIG="/etc/nginx/sites-available/$SITE_NAME"

echo -e "${YELLOW}Configuring Nginx...${NC}"

sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SITE_NAME www.$SITE_NAME;

    root $(pwd)/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Enable the site
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Test nginx config
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart nginx
echo -e "${YELLOW}Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Your site is now live at: ${YELLOW}http://$SITE_NAME${NC}"
echo ""
echo -e "${YELLOW}Next steps for HTTPS (recommended):${NC}"
echo "1. Install Certbot: sudo apt install certbot python3-certbot-nginx"
echo "2. Get SSL cert: sudo certbot --nginx -d $SITE_NAME -d www.$SITE_NAME"
echo ""
echo -e "${GREEN}🏈 RCL - Redzone Championship League${NC}"
