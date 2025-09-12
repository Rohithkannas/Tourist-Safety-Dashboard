import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createStore } from './mockData.js';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

const store = createStore();

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: '🚀 Tourist Safety Dashboard Backend is running',
    endpoints: ['/health', '/api/tourists', '/api/alerts', '/api/restricted']
  });
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// API endpoints
app.get('/api/tourists', (_req, res) => res.json(store.getTourists()));
app.get('/api/alerts', (_req, res) => res.json(store.getAlerts()));
app.get('/api/restricted', (_req, res) => res.json({ polygon: store.getRestricted() }));

app.post('/api/alerts/:id/ack', (req, res) => {
  const ok = store.setAlertStatus(req.params.id, 'ack');
  if (!ok) return res.status(404).json({ error: 'Not found' });
  io.emit('alerts:update', store.getAlerts());
  return res.json({ ok: true });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const ok = store.setAlertStatus(req.params.id, 'resolved');
  if (!ok) return res.status(404).json({ error: 'Not found' });
  io.emit('alerts:update', store.getAlerts());
  return res.json({ ok: true });
});

// Socket events - push periodic updates
io.on('connection', (socket) => {
  socket.emit('tourists:update', store.getTourists());
  socket.emit('alerts:update', store.getAlerts());
});

setInterval(() => {
  store.tick(); // move tourists and update trails
  io.emit('tourists:update', store.getTourists());
}, 3000);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});
