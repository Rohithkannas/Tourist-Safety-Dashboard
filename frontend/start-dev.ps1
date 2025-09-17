# Tourist Safety Dashboard - Development Server Starter
Write-Host "🧹 Cleaning up ports and starting Tourist Safety Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Function to kill processes on a specific port
function Kill-ProcessOnPort {
    param([int]$Port)
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        
        if ($processes) {
            Write-Host "🔪 Killing processes on port $Port..." -ForegroundColor Yellow
            foreach ($pid in $processes) {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✅ Killed process $pid" -ForegroundColor Green
                } catch {
                    Write-Host "  ⚠️  Could not kill process $pid" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "✅ Port $Port is already free" -ForegroundColor Green
        }
    } catch {
        Write-Host "✅ Port $Port is free" -ForegroundColor Green
    }
}

# Kill processes on common development ports
$ports = @(3000, 5500, 8000, 8080)
foreach ($port in $ports) {
    Kill-ProcessOnPort -Port $port
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan

# Start the development server
try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start development server" -ForegroundColor Red
    Write-Host "Make sure you have Node.js and npm installed" -ForegroundColor Yellow
    Write-Host "Run 'npm install' first if you haven't already" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")