
# HostelHub - Start All Services
Write-Host "🚀 Starting HostelHub Portal..." -ForegroundColor Cyan

# Launch Backend API Server
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
cd 'D:\HTML\HOSTEL MANAGEMENT WEBSITE\backend'
Write-Host '⚙️  HostelHub Backend API Server' -ForegroundColor Green
Write-Host '   Port: http://localhost:5000' -ForegroundColor Yellow
node src/index.js
"@

Start-Sleep -Seconds 2

# Launch Frontend Dev Server
Start-Process powershell -ArgumentList '-NoExit', '-Command', @"
cd 'D:\HTML\HOSTEL MANAGEMENT WEBSITE\frontend'
Write-Host '🌐 HostelHub Frontend Dashboard' -ForegroundColor Green
Write-Host '   Port: http://localhost:5173' -ForegroundColor Yellow
npm.cmd run dev
"@

Start-Sleep -Seconds 3

# Open browser
Start-Process "http://localhost:5173"
Write-Host "✅ HostelHub launched! Opening browser at http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Admin  → admin@hostel.com / adminpassword123" -ForegroundColor White
Write-Host "   Student → Register via Sign Up tab on the login page" -ForegroundColor White
