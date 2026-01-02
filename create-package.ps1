# PowerShell Script to Create Upload Package and Deploy

Write-Host "🚀 WEintegrity Deployment Package Creator" -ForegroundColor Cyan
Write-Host ""

# Check if tar is available
if (!(Get-Command tar -ErrorAction SilentlyContinue)) {
    Write-Host "❌ tar command not found. Please install Git for Windows or use WSL." -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Exclude patterns
$excludes = @(
    "--exclude=node_modules",
    "--exclude=frontend/node_modules",
    "--exclude=backend/node_modules", 
    "--exclude=.git",
    "--exclude=venv",
    "--exclude=*.log"
)

# Create tar archive
$tarArgs = @("-czf", "weintegrity-deploy.tar.gz") + $excludes + @(".")
& tar @tarArgs

if (Test-Path "weintegrity-deploy.tar.gz") {
    Write-Host "✅ Package created successfully: weintegrity-deploy.tar.gz" -ForegroundColor Green
    $size = (Get-Item "weintegrity-deploy.tar.gz").Length / 1MB
    Write-Host "   Size: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to create package" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1: Upload via SCP" -ForegroundColor Yellow
Write-Host "-------------------------"
Write-Host "1. Upload package to server:" -ForegroundColor White
Write-Host '   scp weintegrity-deploy.tar.gz USER@SERVER_IP:/tmp/' -ForegroundColor Green
Write-Host ""
Write-Host "2. SSH into server:" -ForegroundColor White
Write-Host '   ssh USER@SERVER_IP' -ForegroundColor Green
Write-Host ""
Write-Host "3. Extract and setup:" -ForegroundColor White
Write-Host '   sudo mkdir -p /var/www/weintegrity' -ForegroundColor Green
Write-Host '   sudo chown -R $USER:$USER /var/www/weintegrity' -ForegroundColor Green
Write-Host '   cd /var/www/weintegrity' -ForegroundColor Green
Write-Host '   tar -xzf /tmp/weintegrity-deploy.tar.gz' -ForegroundColor Green
Write-Host '   chmod +x *.sh' -ForegroundColor Green
Write-Host '   ./setup-server.sh' -ForegroundColor Green
Write-Host ""
Write-Host "4. Configure environment:" -ForegroundColor White
Write-Host '   cd backend' -ForegroundColor Green
Write-Host '   cp .env.production .env' -ForegroundColor Green
Write-Host '   nano .env  # Update with your values' -ForegroundColor Green
Write-Host ""
Write-Host "5. Deploy:" -ForegroundColor White
Write-Host '   cd ..' -ForegroundColor Green
Write-Host '   ./deploy-server.sh' -ForegroundColor Green
Write-Host ""
Write-Host "6. Setup SSL:" -ForegroundColor White
Write-Host '   sudo certbot --nginx -d dev.weintegrity.com' -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Use SFTP Client (FileZilla/WinSCP)" -ForegroundColor Yellow
Write-Host "----------------------------------------------"
Write-Host "1. Extract weintegrity-deploy.tar.gz locally first"
Write-Host "2. Use FileZilla/WinSCP to upload all files to /var/www/weintegrity"
Write-Host "3. Then SSH and run setup-server.sh and deploy-server.sh"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed instructions, see UPLOAD_INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "✨ Package is ready for deployment!" -ForegroundColor Green
Write-Host ""
