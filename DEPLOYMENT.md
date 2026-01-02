# 🚀 WEintegrity Production Deployment Guide

## Prerequisites Checklist
- ✅ Cloud server with Ubuntu/Debian (recommended)
- ✅ SSH access to server
- ✅ Domain DNS pointing to your server IP (dev.weintegrity.com → Your Server IP)
- ✅ MongoDB Atlas account and cluster set up
- ✅ Nginx installed on server
- ✅ Node.js v14+ installed on server

---

## Step 1: DNS Configuration

Before deployment, ensure your DNS is configured:

1. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Add an **A Record**:
   - Type: `A`
   - Name: `dev` (or `@` for root domain)
   - Value: `YOUR_SERVER_IP_ADDRESS`
   - TTL: `3600` or `Auto`

3. Wait for DNS propagation (5-30 minutes)
4. Test: `ping dev.weintegrity.com` should respond with your server IP

---

## Step 2: Server Initial Setup

SSH into your server and run these commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (if not installed)
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Create project directory
sudo mkdir -p /var/www/weintegrity
sudo chown -R $USER:$USER /var/www/weintegrity
```

---

## Step 3: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (or use existing)
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `weintegrity_user`
   - Password: Generate a strong password
   - Database User Privileges: `Read and write to any database`

4. Whitelist your server IP:
   - Network Access → Add IP Address
   - Add your server's public IP
   - Or use `0.0.0.0/0` for all IPs (less secure but simpler)

5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy the connection string:
   ```
   mongodb+srv://weintegrity_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://...mongodb.net/weintegrity?retryWrites=true&w=majority`

---

## Step 4: Deploy Your Project to Server

### Option A: Using Git (Recommended)

```bash
# On your server
cd /var/www/weintegrity

# Clone your repository
git clone https://github.com/your-username/your-repo.git .

# Or if already cloned, pull latest changes
git pull origin main
```

### Option B: Using SCP/SFTP

From your local machine:

```powershell
# Navigate to your project directory
cd "D:\SLYR\WEintegrity Internship\WEi-final\WEi-website"

# Upload files to server (replace USER and SERVER_IP)
scp -r ./* USER@SERVER_IP:/var/www/weintegrity/
```

---

## Step 5: Configure Environment Variables

On your server:

```bash
cd /var/www/weintegrity/backend

# Create .env file from template
cp .env.production .env

# Edit the .env file
nano .env
```

Update with your actual values:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection String (from Step 3)
MONGODB_URI=mongodb+srv://weintegrity_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weintegrity?retryWrites=true&w=majority

# Generate a strong JWT secret
JWT_SECRET=YOUR_RANDOM_SECRET_KEY_HERE_MIN_32_CHARS

# Gmail credentials for email notifications
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Your domain
CLIENT_URL=https://dev.weintegrity.com

MAX_REQUEST_SIZE=50mb
```

**Important**: Generate a strong JWT secret:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit (Ctrl+X, then Y, then Enter in nano)

---

## Step 6: Install Dependencies and Build Frontend

```bash
# Install backend dependencies
cd /var/www/weintegrity/backend
npm install --production

# Install frontend dependencies
cd /var/www/weintegrity/frontend
npm install

# Build frontend for production
npm run build
# This creates /var/www/weintegrity/frontend/dist folder
```

---

## Step 7: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/weintegrity/nginx.conf /etc/nginx/sites-available/weintegrity

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/weintegrity /etc/nginx/sites-enabled/

# Remove default nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

---

## Step 8: Set Up SSL with Let's Encrypt

```bash
# Run certbot to get SSL certificate
sudo certbot --nginx -d dev.weintegrity.com

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Choose to redirect HTTP to HTTPS (option 2)

# Certbot will automatically:
# 1. Get SSL certificate from Let's Encrypt
# 2. Update your nginx configuration
# 3. Set up auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

After SSL is configured, update your nginx config:

```bash
sudo nano /etc/nginx/sites-available/weintegrity
```

Uncomment all the SSL-related lines (the ones starting with `#` in the nginx.conf file)

Then reload nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 9: Set Up Backend Service

### Option A: Using systemd (Recommended)

```bash
# Copy service file
sudo cp /var/www/weintegrity/weintegrity.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable weintegrity

# Start the service
sudo systemctl start weintegrity

# Check status
sudo systemctl status weintegrity

# View logs
sudo journalctl -u weintegrity -f
```

### Option B: Using PM2

```bash
cd /var/www/weintegrity

# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Run the command it outputs

# Monitor
pm2 monit

# View logs
pm2 logs weintegrity-backend
```

---

## Step 10: Verify Deployment

### Test Backend API
```bash
curl http://localhost:5000/
# Should return: {"message":"WEintegrity API Server"}
```

### Test Frontend
Open in browser: `https://dev.weintegrity.com`

### Check Services
```bash
# Check Nginx
sudo systemctl status nginx

# Check Backend (systemd)
sudo systemctl status weintegrity

# Or check Backend (PM2)
pm2 status

# Check logs
sudo tail -f /var/log/nginx/weintegrity_access.log
sudo journalctl -u weintegrity -f
```

---

## Step 11: Final Configuration

### Update Frontend API URLs (if needed)
The frontend is already configured to use relative URLs in production (`/api`), which Nginx proxies to the backend.

### Test Email Functionality
1. Go to `https://dev.weintegrity.com/register`
2. Register a new account
3. Use "Forgot Password" feature
4. Check if emails are being sent

### Create Initial Manager Account
SSH into server and run:
```bash
cd /var/www/weintegrity/backend
node createTestManager.js
```

---

## Deployment Script (For Future Updates)

For future deployments, use the deployment script:

```bash
cd /var/www/weintegrity
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart weintegrity
sudo systemctl reload nginx
```

---

## Common Commands

```bash
# Restart backend (systemd)
sudo systemctl restart weintegrity
sudo systemctl status weintegrity

# Restart backend (PM2)
pm2 restart weintegrity-backend
pm2 logs weintegrity-backend

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# View backend logs (systemd)
sudo journalctl -u weintegrity -f

# View backend logs (PM2)
pm2 logs weintegrity-backend

# View Nginx logs
sudo tail -f /var/log/nginx/weintegrity_access.log
sudo tail -f /var/log/nginx/weintegrity_error.log

# Test MongoDB connection from server
cd /var/www/weintegrity/backend
node -e "require('dotenv').config(); require('./config/db')();"
```

---

## Security Checklist

- ✅ SSL certificate configured (HTTPS)
- ✅ MongoDB Atlas with IP whitelist
- ✅ Strong JWT secret
- ✅ Environment variables secured (not in git)
- ✅ Firewall configured (UFW):
  ```bash
  sudo ufw allow 22/tcp    # SSH
  sudo ufw allow 80/tcp    # HTTP
  sudo ufw allow 443/tcp   # HTTPS
  sudo ufw enable
  ```
- ✅ Regular updates: `sudo apt update && sudo apt upgrade`
- ✅ Nginx security headers (already in config)

---

## Troubleshooting

### 502 Bad Gateway
- Backend service not running: `sudo systemctl status weintegrity`
- Check backend logs: `sudo journalctl -u weintegrity -f`
- Verify port 5000 is open: `netstat -tulpn | grep 5000`

### 404 Not Found
- Check Nginx configuration: `sudo nginx -t`
- Verify frontend build exists: `ls /var/www/weintegrity/frontend/dist`
- Check Nginx error log: `sudo tail -f /var/log/nginx/weintegrity_error.log`

### Database Connection Error
- Verify MongoDB Atlas connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Test connection: `node -e "require('dotenv').config(); require('./config/db')();"`

### Email Not Sending
- Verify Gmail credentials in `.env`
- Check if Gmail App Password is used (not regular password)
- Check backend logs for email errors

### CORS Errors
- Verify domain in backend CORS configuration
- Check browser console for specific error
- Ensure `CLIENT_URL` in `.env` matches your domain

---

## Monitoring & Maintenance

### Set Up Log Rotation
```bash
sudo nano /etc/logrotate.d/weintegrity
```

Add:
```
/var/log/nginx/weintegrity_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### Set Up Monitoring (Optional)
- Use PM2 monitoring: `pm2 install pm2-server-monit`
- Set up Uptime monitoring (UptimeRobot, Pingdom)
- Configure email alerts for service failures

---

## Backup Strategy

### Database Backup (MongoDB Atlas)
- Configure automatic backups in MongoDB Atlas dashboard
- Or use manual backup:
  ```bash
  mongodump --uri="mongodb+srv://..." --out=/backup/db-$(date +%Y%m%d)
  ```

### Code Backup
- Keep code in Git repository
- Regular commits and pushes

---

## Performance Optimization

Already implemented:
- ✅ Gzip compression (Nginx + Express)
- ✅ Static asset caching
- ✅ MongoDB connection pooling
- ✅ Express compression middleware

Future optimizations:
- CDN for static assets (Cloudflare)
- Redis for session/cache storage
- Load balancer for scaling
- Database indexing

---

## Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables are correct
3. Ensure all services are running
4. Check DNS and SSL configuration
5. Test backend API directly: `curl https://dev.weintegrity.com/api/`

---

## 🎉 Congratulations!

Your WEintegrity website should now be live at:
**https://dev.weintegrity.com**

Test all features:
- ✅ User registration
- ✅ Login/Logout
- ✅ Course browsing
- ✅ Applications
- ✅ Manager dashboard
- ✅ Email notifications

Happy deploying! 🚀
