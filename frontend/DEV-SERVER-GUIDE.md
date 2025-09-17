# Development Server Guide

This guide helps you start the Tourist Safety Dashboard development server without port conflicts.

## 🚀 Quick Start Options

### Option 1: Automatic Port Detection (Recommended)
```bash
npm run dev
```
This will automatically find an available port from a wide range (3000-9000) and start the server.

### Option 2: Force Kill and Start
```bash
npm run dev:force
```
This will kill any processes using common development ports and then start the server.

### Option 3: Windows Scripts
**For Command Prompt:**
```cmd
start-dev.bat
```

**For PowerShell:**
```powershell
.\start-dev.ps1
```

### Option 4: Specific Port
```bash
npm run dev:3000    # Start on port 3000
npm run dev:5500    # Start on port 5500
npm run dev:8000    # Start on port 8000
```

## 🔧 Troubleshooting

### Port Already in Use Error
If you get "No free port found" error:

1. **Kill processes manually:**
   ```bash
   npm run kill-ports
   ```

2. **Check what's using the ports:**
   ```cmd
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :5500
   
   # Mac/Linux
   lsof -i :3000
   lsof -i :5500
   ```

3. **Kill specific process:**
   ```cmd
   # Windows (replace PID with actual process ID)
   taskkill /F /PID 1234
   
   # Mac/Linux
   kill -9 1234
   ```

### Common Port Conflicts
- **Port 3000**: Often used by React, Next.js
- **Port 5500**: Live Server extension in VS Code
- **Port 8000**: Python development servers
- **Port 8080**: Various development tools

## 🌐 Accessing the Dashboard

Once started, the server will show:
```
🚀 Starting Tourist Safety Dashboard on port 3000...
🌐 Open your browser to: http://localhost:3000
```

The browser should open automatically. If not, manually navigate to the displayed URL.

## 📁 Available Pages

- **Dashboard**: `http://localhost:PORT/dashboard.html`
- **Analytics**: `http://localhost:PORT/analytics.html`
- **Alerts**: `http://localhost:PORT/alerts.html`
- **Settings**: `http://localhost:PORT/settings.html`

## 🛠️ Development Features

- **Auto-reload**: Changes to HTML/CSS/JS files trigger browser refresh
- **CORS enabled**: API calls work properly
- **Cache disabled**: Always serves fresh files
- **Multiple ports**: Automatically finds available ports

## ❓ Need Help?

If you're still having issues:

1. Make sure Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Try the force option: `npm run dev:force`
4. Use a specific port: `npm run dev:3000`

## 🔄 Stopping the Server

- Press `Ctrl+C` in the terminal
- Or close the terminal window
- The server will automatically clean up