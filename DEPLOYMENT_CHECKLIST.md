# 🚀 Quick Deployment Checklist

## Pre-Deployment
- [ ] DNS A record points to server IP (dev.weintegrity.com)
- [ ] MongoDB Atlas cluster created and configured
- [ ] MongoDB user created with read/write access
- [ ] Server IP whitelisted in MongoDB Atlas
- [ ] Node.js v14+ installed on server
- [ ] Nginx installed on server

## On Server Setup
```bash
# 1. Create directory
sudo mkdir -p /var/www/weintegrity
sudo chown -R $USER:$USER /var/www/weintegrity

# 2. Upload/clone project files to /var/www/weintegrity

# 3. Install dependencies
cd /var/www/weintegrity/backend
npm install --production

cd /var/www/weintegrity/frontend
npm install
npm run build

# 4. Configure environment
cd /var/www/weintegrity/backend
cp .env.production .env
nano .env  # Update with your values

# 5. Setup Nginx
sudo cp /var/www/weintegrity/nginx.conf /etc/nginx/sites-available/weintegrity
sudo ln -s /etc/nginx/sites-available/weintegrity /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Setup SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dev.weintegrity.com

# 7. Start backend service
sudo cp /var/www/weintegrity/weintegrity.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable weintegrity
sudo systemctl start weintegrity

# 8. Verify
sudo systemctl status weintegrity
sudo systemctl status nginx
curl https://dev.weintegrity.com
```

## Required .env Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/weintegrity
JWT_SECRET=your_64_char_random_secret
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=https://dev.weintegrity.com
```

## Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment Tests
- [ ] Visit https://dev.weintegrity.com
- [ ] Register new account
- [ ] Test login/logout
- [ ] Browse courses
- [ ] Submit application
- [ ] Test forgot password email
- [ ] Check manager dashboard
- [ ] Verify email notifications

## Common Issues
- **502 Bad Gateway**: Backend not running → `sudo systemctl start weintegrity`
- **CORS Error**: Update CORS origins in backend/server.js
- **DB Connection**: Check MongoDB URI and IP whitelist
- **SSL Issues**: Rerun `sudo certbot --nginx -d dev.weintegrity.com`

## Update/Redeploy
```bash
cd /var/www/weintegrity
git pull origin main
./deploy.sh
```

## Logs
```bash
# Backend logs
sudo journalctl -u weintegrity -f

# Nginx logs
sudo tail -f /var/log/nginx/weintegrity_error.log
```

---
For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
