@echo off
REM Windows Script to Create Upload Package

echo Creating deployment package...

REM Create archive excluding node_modules
tar -czf weintegrity-deploy.tar.gz ^
    --exclude=node_modules ^
    --exclude=frontend/node_modules ^
    --exclude=backend/node_modules ^
    --exclude=.git ^
    --exclude=frontend/dist ^
    .

echo.
echo ✅ Package created: weintegrity-deploy.tar.gz
echo.
echo Next steps:
echo 1. Upload this file to your server:
echo    scp weintegrity-deploy.tar.gz USER@SERVER_IP:/tmp/
echo.
echo 2. SSH into your server:
echo    ssh USER@SERVER_IP
echo.
echo 3. Extract and deploy:
echo    sudo mkdir -p /var/www/weintegrity
echo    sudo chown -R $USER:$USER /var/www/weintegrity
echo    cd /var/www/weintegrity
echo    tar -xzf /tmp/weintegrity-deploy.tar.gz
echo    chmod +x setup-server.sh deploy-server.sh
echo    ./setup-server.sh
echo    [Configure .env file]
echo    ./deploy-server.sh
echo.
pause
