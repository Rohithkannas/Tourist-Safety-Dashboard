#!/usr/bin/env node
// Auto-pick a free port (5500, 5510, 5520) and start http-server using Node directly
const { createServer } = require('net');
const { spawn } = require('child_process');
const path = require('path');

const candidates = [5500, 5510, 5520];

function checkPort(port){
  return new Promise((resolve)=>{
    const srv = createServer();
    srv.once('error', ()=> resolve(false));
    srv.once('listening', ()=>{ srv.close(()=> resolve(true)); });
    srv.listen(port, '0.0.0.0');
  });
}

(async ()=>{
  let port = null;
  for (const p of candidates){
    // eslint-disable-next-line no-await-in-loop
    const free = await checkPort(p);
    if (free){ port = p; break; }
  }
  if (!port){ console.error('No free port found among', candidates.join(', ')); process.exit(1); }
  console.log(`Starting frontend on port ${port}...`);
  // Resolve the http-server bin script and run it with Node. This avoids spawn EINVAL issues on Windows.
  let httpServerBin;
  try {
    httpServerBin = require.resolve('http-server/bin/http-server');
  } catch(e) {
    httpServerBin = path.join(__dirname, '..', 'node_modules', 'http-server', 'bin', 'http-server');
  }
  const child = spawn(process.execPath, [httpServerBin, '.', '-p', String(port), '-c-1'], { stdio: 'inherit' });
  child.on('exit', code => process.exit(code ?? 0));
})();
