#!/bin/bash

# RCL League Website Deployment Script
# For Ubuntu/Debian VMs with Namecheap domain

echo "   RCL League Website Deployment"
echo "================================="

# Ask for domain and email
read -p "Enter your domain (e.g., rcl-uf.xyz): " DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Error: Domain and email are required!"
    exit 1
fi

echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

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

# Build the project using npx to avoid permission issues
echo -e "${YELLOW}Building the project...${NC}"
npx vite build

# Check if nginx is installed, if not install it
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Create nginx config for the site
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

echo -e "${YELLOW}Configuring Nginx...${NC}"

sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

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

# Remove default nginx site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
sudo nginx -t

# Restart nginx
echo -e "${YELLOW}Restarting Nginx...${NC}"
sudo systemctl restart nginx
sudo systemctl enable nginx

# Install Certbot and get SSL certificate
echo -e "${YELLOW}Installing Certbot for SSL...${NC}"
sudo apt-get install -y certbot python3-certbot-nginx

echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Your site is now live at: ${YELLOW}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Namecheap DNS Setup:${NC}"
echo "1. Go to Namecheap > Domain List > Manage > Advanced DNS"
echo "2. Add A Record: Host '@' -> Value: $(curl -s ifconfig.me)"
echo "3. Add A Record: Host 'www' -> Value: $(curl -s ifconfig.me)"
echo ""
echo -e "${GREEN}🏈 RCL - Redzone Championship League${NC}"
