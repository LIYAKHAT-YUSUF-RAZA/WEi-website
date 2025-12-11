# WEintegrity Website - Start Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting WEintegrity Website..." -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Virtual environment is active" -ForegroundColor Green
} else {
    Write-Host "⚠️  Activating virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
}

Write-Host ""
Write-Host "📦 Starting Backend Server..." -ForegroundColor Cyan
Write-Host "   Backend will run on: http://localhost:5000" -ForegroundColor Gray

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "   Frontend will run on: http://localhost:3000" -ForegroundColor Gray

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Frontend Server' -ForegroundColor Blue; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Important URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Quick Test:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000" -ForegroundColor White
Write-Host "   2. Register as 'candidate' or 'manager'" -ForegroundColor White
Write-Host "   3. Explore the features!" -ForegroundColor White
Write-Host ""
Write-Host "ℹ️  Press Ctrl+C in each server window to stop them" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy Coding! 🚀" -ForegroundColor Magenta
