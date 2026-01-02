# 🚀 UPLOAD AND DEPLOY INSTRUCTIONS

## What You Need
- SSH access to your server
- Server IP address
- Domain DNS already pointing to your server (dev.weintegrity.com → your IP)
- MongoDB Atlas connection string ready

---

## STEP-BY-STEP DEPLOYMENT

### STEP 1: Upload Files to Server

Choose one method:

#### Method A: Using SCP (Recommended)

Open PowerShell on your local machine:

```powershell
# Navigate to project directory
cd "D:\SLYR\WEintegrity Internship\WEi-final\WEi-website"

# Create tar archive (requires tar in Windows)
tar -czf weintegrity.tar.gz --exclude=node_modules --exclude=frontend/node_modules --exclude=backend/node_modules --exclude=.git .

# Upload to server (replace USER and SERVER_IP)
scp weintegrity.tar.gz USER@SERVER_IP:/tmp/

# SSH into server
ssh USER@SERVER_IP

# On server: Extract files
sudo mkdir -p /var/www/weintegrity
sudo chown -R $USER:$USER /var/www/weintegrity
cd /var/www/weintegrity
tar -xzf /tmp/weintegrity.tar.gz
rm /tmp/weintegrity.tar.gz
```

#### Method B: Using Git (If you have a repository)

```bash
# SSH into your server
ssh USER@SERVER_IP

# Clone repository
sudo mkdir -p /var/www/weintegrity
sudo chown -R $USER:$USER /var/www/weintegrity
cd /var/www/weintegrity
git clone YOUR_REPO_URL .
```

#### Method C: Using SFTP Client (FileZilla, WinSCP)

1. Open FileZilla or WinSCP
2. Connect to your server (SERVER_IP, port 22)
3. Navigate to `/var/www/weintegrity` on server
4. Upload all project files (except node_modules folders)

---

### STEP 2: Run Server Setup Script

SSH into your server and run:

```bash
ssh USER@SERVER_IP

cd /var/www/weintegrity
chmod +x setup-server.sh
./setup-server.sh
```

This will install:
- Node.js
- Nginx
- Certbot (for SSL)
- Create necessary directories

---

### STEP 3: Configure Environment Variables

Still on your server:

```bash
cd /var/www/weintegrity/backend
cp .env.production .env
nano .env
```

**Update these values:**

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas (GET THIS FROM YOUR MONGODB ATLAS DASHBOARD)
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/weintegrity?retryWrites=true&w=majority

# Generate JWT Secret (run this command to generate):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=paste_the_generated_secret_here

# Your Gmail credentials
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Your domain
CLIENT_URL=https://dev.weintegrity.com

MAX_REQUEST_SIZE=50mb
```

**To generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

---

### STEP 4: Run Deployment Script

```bash
cd /var/www/weintegrity
chmod +x deploy-server.sh
./deploy-server.sh
```

This script will:
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Build frontend for production
- ✅ Configure Nginx
- ✅ Start backend service
- ✅ Verify everything is running

---

### STEP 5: Setup SSL Certificate

```bash
sudo certbot --nginx -d dev.weintegrity.com
```

Follow the prompts:
1. Enter your email
2. Agree to terms
3. Choose option 2 (Redirect HTTP to HTTPS)

After SSL is configured:

```bash
# Edit nginx config to enable SSL
sudo nano /etc/nginx/sites-available/weintegrity

# Uncomment all SSL-related lines (remove the # at the beginning)
# Lines starting with:
# listen 443 ssl http2;
# ssl_certificate
# ssl_certificate_key
# include /etc/letsencrypt/...
# ssl_dhparam
# return 301 https://...

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

### STEP 6: Verify Deployment

#### Test Backend
```bash
curl http://localhost:5000/
# Should return: {"message":"WEintegrity API Server"}
```

#### Test Frontend
Open browser: `https://dev.weintegrity.com`

#### Check Services
```bash
# Backend status
sudo systemctl status weintegrity

# Nginx status
sudo systemctl status nginx

# View logs
sudo journalctl -u weintegrity -f
```

---

## 🎉 DEPLOYMENT COMPLETE!

Your website should now be live at: **https://dev.weintegrity.com**

### Test These Features:
1. ✅ Register new account
2. ✅ Login/Logout
3. ✅ Browse courses
4. ✅ Apply for internship
5. ✅ Manager dashboard
6. ✅ Email notifications (forgot password)

---

## 📊 Useful Commands

```bash
# Restart backend
sudo systemctl restart weintegrity
sudo systemctl status weintegrity

# View backend logs
sudo journalctl -u weintegrity -f

# Restart Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/weintegrity_error.log
sudo tail -f /var/log/nginx/weintegrity_access.log

# Check if ports are open
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Check logs
sudo journalctl -u weintegrity -n 50

# Verify .env file
cat /var/www/weintegrity/backend/.env

# Test MongoDB connection
cd /var/www/weintegrity/backend
node -e "require('dotenv').config(); require('./config/db')();"
```

### 502 Bad Gateway?
- Backend service stopped: `sudo systemctl start weintegrity`
- Wrong port in nginx config
- Firewall blocking port 5000

### CORS Errors?
- Check CLIENT_URL in backend/.env matches your domain
- Verify CORS configuration in backend/server.js

### SSL Not Working?
```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew --dry-run

# Verify nginx SSL config is uncommented
sudo nano /etc/nginx/sites-available/weintegrity
```

---

## 🔄 Future Updates

To update your deployment:

```bash
ssh USER@SERVER_IP
cd /var/www/weintegrity

# Pull latest changes (if using git)
git pull origin main

# Or upload new files via SCP

# Rebuild and restart
cd frontend
npm install
npm run build

cd ../backend
npm install --production

# Restart service
sudo systemctl restart weintegrity
sudo systemctl reload nginx
```

---

## 🆘 Need Help?

**Check these first:**
1. DNS pointing to correct IP: `ping dev.weintegrity.com`
2. MongoDB Atlas IP whitelist includes your server IP
3. All environment variables are correct in backend/.env
4. Services are running: `sudo systemctl status weintegrity nginx`

**Get Logs:**
```bash
# All backend logs
sudo journalctl -u weintegrity --no-pager -n 100

# Nginx error log
sudo tail -n 100 /var/log/nginx/weintegrity_error.log
```

---

Good luck with your deployment! 🚀
