#!/usr/bin/env node
// Auto-pick a free port from a wide range and start http-server using Node directly
const { createServer } = require('net');
const { spawn } = require('child_process');
const path = require('path');

// Expanded port range for better availability
const preferredPorts = [3000, 3001, 3002, 5500, 5501, 5502, 8000, 8001, 8002, 8080, 8081, 8082];

function checkPort(port){
  return new Promise((resolve)=>{
    const srv = createServer();
    srv.once('error', ()=> resolve(false));
    srv.once('listening', ()=>{ srv.close(()=> resolve(true)); });
    srv.listen(port, '0.0.0.0');
  });
}

// Find any available port in range if preferred ports are taken
async function findAvailablePort() {
  // First try preferred ports
  for (const port of preferredPorts) {
    const free = await checkPort(port);
    if (free) return port;
  }
  
  // If all preferred ports are taken, try a range of ports
  for (let port = 3000; port <= 9000; port++) {
    // Skip ports that might be reserved or commonly used by other services
    if (port === 3306 || port === 5432 || port === 6379 || port === 27017) continue;
    
    const free = await checkPort(port);
    if (free) return port;
  }
  
  return null;
}

(async ()=>{
  console.log('🔍 Searching for available port...');
  
  const port = await findAvailablePort();
  
  if (!port) { 
    console.error('❌ No free port found in range 3000-9000');
    console.log('💡 Try closing other development servers or applications using these ports');
    process.exit(1); 
  }
  
  console.log(`🚀 Starting Tourist Safety Dashboard on port ${port}...`);
  console.log(`🌐 Open your browser to: http://localhost:${port}`);
  
  // Resolve the http-server bin script and run it with Node. This avoids spawn EINVAL issues on Windows.
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
