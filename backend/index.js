import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import Joi from 'joi';
import { createStore } from './mockData.js';

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.API_KEY || 'dev-key';
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
setInterval(()=>{ store.tick(); io.emit('tourists:update', store.getTourists()); }, 3000);
server.listen(PORT, ()=>{ console.log(`Server listening on http://localhost:${PORT}`); });
