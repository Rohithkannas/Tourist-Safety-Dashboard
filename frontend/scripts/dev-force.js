#!/usr/bin/env node
// Force kill processes on common ports and start the development server
const { exec, spawn } = require('child_process');
const { createServer } = require('net');
const path = require('path');
const os = require('os');

const commonPorts = [3000, 5500, 8000, 8080];

function checkPort(port){
  return new Promise((resolve)=>{
    const srv = createServer();
    srv.once('error', ()=> resolve(false));
    srv.once('listening', ()=>{ srv.close(()=> resolve(true)); });
    srv.listen(port, '0.0.0.0');
  });
}

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWindows = os.platform() === 'win32';
    
    if (isWindows) {
      // Windows command to find and kill process on port
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          resolve();
          return;
        }
        
        const lines = stdout.split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
            pids.add(parts[4]);
          }
        });
        
        if (pids.size === 0) {
          resolve();
          return;
        }
        
        const pidArray = Array.from(pids);
        console.log(`🔪 Killing processes on port ${port}: ${pidArray.join(', ')}`);
        
        exec(`taskkill /F /PID ${pidArray.join(' /PID ')}`, (killError) => {
          if (killError) {
            console.log(`⚠️  Could not kill some processes on port ${port}`);
          } else {
            console.log(`✅ Freed port ${port}`);
          }
          resolve();
        });
      });
    } else {
      // Unix/Linux/Mac command
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (error || !stdout) {
          resolve();
          return;
        }
        
        const pids = stdout.trim().split('\n').filter(pid => pid);
        if (pids.length === 0) {
          resolve();
          return;
        }
        
        console.log(`🔪 Killing processes on port ${port}: ${pids.join(', ')}`);
        exec(`kill -9 ${pids.join(' ')}`, (killError) => {
          if (killError) {
            console.log(`⚠️  Could not kill some processes on port ${port}`);
          } else {
            console.log(`✅ Freed port ${port}`);
          }
          resolve();
        });
      });
    }
  });
}

async function findAndFreePort() {
  console.log('🧹 Checking and freeing common development ports...');
  
  // Kill processes on common ports
  for (const port of commonPorts) {
    await killProcessOnPort(port);
  }
  
  // Wait a moment for processes to fully terminate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find first available port
  for (const port of commonPorts) {
    const free = await checkPort(port);
    if (free) return port;
  }
  
  // If still no port available, try extended range
  for (let port = 3000; port <= 9000; port++) {
    const free = await checkPort(port);
    if (free) return port;
  }
  
  return null;
}

(async ()=>{
  const port = await findAndFreePort();
  
  if (!port) { 
    console.error('❌ Could not find or free any ports');
    process.exit(1); 
  }
  
  console.log(`🚀 Starting Tourist Safety Dashboard on port ${port}...`);
  console.log(`🌐 Open your browser to: http://localhost:${port}`);
  
  // Resolve the http-server bin script and run it with Node
  let httpServerBin;
  try {
    httpServerBin = require.resolve('http-server/bin/http-server');
  } catch(e) {
    httpServerBin = path.join(__dirname, '..', 'node_modules', 'http-server', 'bin', 'http-server');
  }
  
  const child = spawn(process.execPath, [
    httpServerBin, 
    '.', 
    '-p', String(port), 
    '-c-1',  // Disable caching
    '--cors', // Enable CORS
    '-o'  // Open browser automatically
  ], { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  child.on('exit', code => {
    console.log(`\n👋 Development server stopped`);
    process.exit(code ?? 0);
  });
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    child.kill('SIGINT');
  });
})();