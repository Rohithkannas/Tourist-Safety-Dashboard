import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import Joi from 'joi';
import { createStore } from './mockData.js';
import { Issuer, generators } from 'openid-client';

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IN_PROD = NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-change-me';
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500').split(',');
const API_KEY = process.env.API_KEY || 'dev-key'; // legacy support for API/Sockets
const OIDC_ISSUER = process.env.OIDC_ISSUER || '';
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || '';
const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || '';
const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || 'http://localhost:4000/auth/sso/callback';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(helmet.hsts({ maxAge: 31536000 }));
// Basic CSP for API (liberal since frontend is served separately)
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    defaultSrc: ["'self'"],
  }
}));

// Rate limit
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const store = createStore();

app.get('/health', (_req,res)=> res.json({ ok: true }));
app.get('/api/tourists', (_req,res)=> res.json(store.getTourists()));
app.get('/api/alerts', (_req,res)=> res.json(store.getAlerts()));
app.get('/api/restricted', (_req,res)=> res.json({ polygon: store.getRestricted() }));

// API key middleware for state-changing operations
function requireApiKey(req, res, next){
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (token === API_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

const idSchema = Joi.string().pattern(/^S\d+$/).required();

app.post('/api/alerts/:id/ack', requireApiKey, (req,res)=>{
  const { error } = idSchema.validate(req.params.id);
  if (error) return res.status(400).json({ error: 'Invalid id' });
  const ok = store.setAlertStatus(req.params.id,'ack');
  if(!ok) return res.status(404).json({error:'Not found'});
  io.emit('alerts:update', store.getAlerts());
  return res.json({ok:true});
});

app.post('/api/alerts/:id/resolve', requireApiKey, (req,res)=>{
  const { error } = idSchema.validate(req.params.id);
  if (error) return res.status(400).json({ error: 'Invalid id' });
  const ok = store.setAlertStatus(req.params.id,'resolved');
  if(!ok) return res.status(404).json({error:'Not found'});
  io.emit('alerts:update', store.getAlerts());
  return res.json({ok:true});
});

io.use((socket, next)=>{
  const token = socket.handshake.auth?.token;
  if (token === API_KEY) return next();
  return next(new Error('Unauthorized'));
});

io.on('connection', (socket)=>{ socket.emit('tourists:update', store.getTourists()); socket.emit('alerts:update', store.getAlerts()); });

let oidcClient = null;
async function initOidc() {
  if (!OIDC_ISSUER || !OIDC_CLIENT_ID) return;
  const issuer = await Issuer.discover(OIDC_ISSUER);
  oidcClient = new issuer.Client({
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET || undefined,
    redirect_uris: [OIDC_REDIRECT_URI],
    response_types: ['code'],
    token_endpoint_auth_method: OIDC_CLIENT_SECRET ? 'client_secret_basic' : 'none',
  });
}
initOidc().catch(err => console.error('OIDC init failed', err));

app.get('/auth/sso/login', async (req, res) => {
  if (!oidcClient) return res.status(501).json({ error: 'SSO not configured' });
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  req.session.oidc = { codeVerifier };
  const url = oidcClient.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return res.redirect(url);
});

app.get('/auth/sso/callback', async (req, res) => {
  try {
    if (!oidcClient) return res.status(501).send('SSO not configured');
    const params = oidcClient.callbackParams(req);
    const tokenSet = await oidcClient.callback(OIDC_REDIRECT_URI, params, { code_verifier: req.session?.oidc?.codeVerifier });
    const claims = tokenSet.claims();
    // Basic mapping: use email; default role mapping could be based on domain
    const email = claims.email || claims.preferred_username || claims.sub;
    const role = email?.endsWith('@tourism.gov.in') ? 'state-admin' : 'dispatcher';
    // Ensure user exists
    let user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      user = { id: uuidv4(), email, passwordHash: '', role, mfa: { enabled: false, secret: null }, failedAttempts: 0, lockUntil: 0 };
      users.set(email, user);
    }
    req.session.user = { id: user.id, email: user.email, role: user.role };
    // Redirect back to frontend dashboard
    const target = (FRONTEND_ORIGINS[0] || '').replace(/\/$/, '') + '/dashboard.html';
    res.redirect(target || '/');
  } catch (e) {
    console.error('SSO callback error', e);
    res.status(400).send('SSO failed');
  }
});

setInterval(()=>{ store.tick(); io.emit('tourists:update', store.getTourists()); }, 3000);
server.listen(PORT, ()=>{ console.log(`Server listening on http://localhost:${PORT}`); });
