# 🚀 Platform-Specific Deployment Guides

Choose your deployment platform and follow the corresponding guide.

---

## Table of Contents

1. [DigitalOcean (Recommended)](#digitalocean-recommended)
2. [Heroku](#heroku)
3. [AWS](#aws)
4. [Vercel (Frontend Only)](#vercel-frontend-only)
5. [Traditional VPS](#traditional-vps)
6. [Docker-Based Deployment](#docker-based-deployment)

---

## DigitalOcean (Recommended)

**Cost:** $12-24/month  
**Ease of Use:** ⭐⭐⭐⭐  
**Scalability:** ⭐⭐⭐⭐  
**Recommendation:** Best for teams starting out

### Step 1: Create Droplet

1. Go to [DigitalOcean Console](https://cloud.digitalocean.com)
2. Click "Create" → "Droplets"
3. Choose image: **Ubuntu 22.04 x64**
4. Choose plan: **Basic** → **$12/month** (2GB RAM, 1 CPU)
5. Region: Choose closest to your users
6. Authentication: Select SSH keys or Password
7. Click "Create Droplet"

### Step 2: Initial Server Setup

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Create deploy user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Add SSH key (copy from local machine)
mkdir -p ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker
docker --version
```

### Step 4: Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

### Step 5: Deploy Application

```bash
# Clone repository
cd /home/deploy
git clone https://github.com/IDSS123a/maldives-adventure-hub.git
cd maldives-adventure-hub

# Create .env file
cp .env.example .env
nano .env  # Add your credentials

# Start application
docker-compose up -d

# Verify
docker ps
curl http://localhost:3000
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/maldives-hub

# Paste this configuration:
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable config
sudo ln -s /etc/nginx/sites-available/maldives-hub /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is configured
sudo systemctl status certbot.timer
```

### Step 8: Firewall Setup

```bash
# Enable firewall
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verify
sudo ufw status
```

### Step 9: Monitoring & Logs

```bash
# View application logs
docker logs -f maldives-hub-app

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor system resources
docker stats
```

### Step 10: Setup Automated Backups

```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/home/deploy/backups
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database (if using)
# pg_dump dbname > $BACKUP_DIR/db_$TIMESTAMP.sql

echo "Backup completed at $TIMESTAMP"
EOF

chmod +x ~/backup.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/deploy/backup.sh
```

---

## Heroku

**Cost:** $50+/month  
**Ease of Use:** ⭐⭐⭐⭐⭐ (Easiest)  
**Scalability:** ⭐⭐⭐  
**Recommendation:** Good for quick deployments, but expensive long-term

### Step 1: Install Heroku CLI

```bash
# macOS with Homebrew
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# Verify
heroku --version
```

### Step 2: Login to Heroku

```bash
heroku login
# Opens browser for authentication
```

### Step 3: Create Procfile

Create `Procfile` in project root:

```
web: npm run build && npx serve -s dist -l 3000
```

### Step 4: Create Heroku App

```bash
# Create app
heroku create maldives-adventure-hub

# Or use specific name
heroku create --name maldives-hub
```

### Step 5: Set Environment Variables

```bash
# Set variables
heroku config:set VITE_SUPABASE_URL=your-url
heroku config:set VITE_SUPABASE_ANON_KEY=your-key
heroku config:set VITE_GOOGLE_CLIENT_ID=your-client-id
heroku config:set VITE_MODE=production

# Verify
heroku config
```

### Step 6: Deploy

```bash
# Push to Heroku
git push heroku main

# Monitor deployment
heroku logs --tail

# Open app
heroku open
```

### Step 7: Domain Setup

```bash
# Add domain
heroku domains:add www.yourdomain.com

# Update DNS records as instructed
# Point to: maldives-hub.herokuapp.com
```

### Step 8: SSL Certificate

SSL is automatic on Heroku. For custom domain:

```bash
# Add paid SSL
heroku certs:add /path/to/cert.pem /path/to/key.pem
```

---

## AWS

**Cost:** Variable (typically $20-100+/month)  
**Ease of Use:** ⭐⭐  
**Scalability:** ⭐⭐⭐⭐⭐ (Most powerful)  
**Recommendation:** For enterprise-scale applications

### Architecture

- **EC2:** Virtual machine for app
- **RDS:** Managed database (optional - using Supabase)
- **S3:** Static file storage
- **CloudFront:** CDN for content delivery
- **Route 53:** DNS management
- **ALB:** Load balancer

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance
3. Choose AMI: Ubuntu Server 22.04 LTS
4. Choose Instance Type: t3.small ($10/month)
5. Configure:
   - Network: Default VPC
   - Storage: 20GB gp3
   - Security group: Allow 80, 443, 22
6. Launch

### Step 2: Connect & Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@instance-ip

# Update system
sudo apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### Step 3: Deploy Application

```bash
# Clone repo
cd /home/ubuntu
git clone https://github.com/IDSS123a/maldives-adventure-hub.git
cd maldives-adventure-hub

# Install & build
npm install
npm run build

# Start with PM2
pm2 start npm --name "maldives-hub" -- run dev
pm2 save
pm2 startup

# Verify
pm2 status
```

### Step 4: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Verify and restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL with ACM

1. Go to AWS Certificate Manager
2. Request certificate for yourdomain.com
3. Validate domain ownership
4. Create ALB (Application Load Balancer)
5. Attach certificate to ALB

---

## Vercel (Frontend Only)

**Cost:** Free-$50/month  
**Ease of Use:** ⭐⭐⭐⭐⭐ (Easiest)  
**Scalability:** ⭐⭐⭐⭐⭐ (Auto-scaling)  
**Recommendation:** Best if you migrate to Next.js

### Prerequisites

- GitHub repository
- Vercel account

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
# Opens browser for authentication
```

### Step 3: Deploy

```bash
# Deploy
vercel --prod

# Or link to GitHub:
# Go to vercel.com → Connect GitHub
```

### Step 4: Environment Variables

```bash
# Set variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_CLIENT_ID
```

### Step 5: Custom Domain

1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add domain
4. Update DNS records

---

## Traditional VPS

**Cost:** $5-20/month  
**Ease of Use:** ⭐⭐⭐  
**Scalability:** ⭐⭐⭐  
**Recommendation:** For full control and lower cost

### Providers
- **Linode**
- **Vultr**
- **OVH**
- **Hetzner**

### Setup Steps

1. Create VPS with Ubuntu 22.04
2. SSH in and run:
   ```bash
   apt update && apt upgrade -y
   apt install -y nodejs npm nginx curl
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```
3. Follow Docker Compose deployment steps
4. Configure Nginx as reverse proxy
5. Setup SSL with Let's Encrypt

---

## Docker-Based Deployment

### Prerequisites

```bash
# Ensure Docker and Docker Compose installed
docker --version
docker-compose --version
```

### Quick Deploy

```bash
# Clone repo
git clone https://github.com/IDSS123a/maldives-adventure-hub.git
cd maldives-adventure-hub

# Create .env
cp .env.example .env
# Edit .env with your credentials

# Deploy
docker-compose up -d

# Verify
docker ps
curl http://localhost:3000
```

### Production Deployment

```bash
# Build image with specific tag
docker build -t maldives-hub:v1.0.0 .

# Tag for registry
docker tag maldives-hub:v1.0.0 your-registry/maldives-hub:v1.0.0

# Push to registry
docker push your-registry/maldives-hub:v1.0.0

# Pull and run on server
docker run -d \
  -p 3000:3000 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  --restart always \
  your-registry/maldives-hub:v1.0.0
```

---

## Comparison Table

| Platform | Cost | Ease | Scalability | Best For |
|----------|------|------|-------------|----------|
| **DigitalOcean** | $$ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Teams, full control |
| **Heroku** | $$$$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Quick demos, simple apps |
| **AWS** | $$$ | ⭐⭐ | ⭐⭐⭐⭐⭐ | Enterprise, scale |
| **Vercel** | $ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Next.js apps, edge |
| **VPS** | $ | ⭐⭐⭐ | ⭐⭐⭐ | Control, cost |

---

## Post-Deployment Verification

After deploying to any platform:

```bash
# Test application
curl -I https://yourdomain.com

# Check response code (should be 200)
# Verify HTTPS is working
# Test key features in browser

# Check logs
# Monitor for first 24 hours
# Verify error tracking is working
```

---

**Last Updated:** December 23, 2025  
**Version:** 1.0.0
