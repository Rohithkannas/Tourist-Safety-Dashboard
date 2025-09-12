# Tourist Safety Backend

A Node.js Express + Socket.IO server providing realtime tourist and alert data.

## Requirements
- Node.js 18+
- npm

## Installation
```bash
cd backend
npm install
```

## Configuration
Create a `.env` file (optional; defaults shown in `.env.example`):
```
API_KEY=dev-key
PORT=4000
CORS_ORIGIN=*
```
- `API_KEY` is required for state-changing POST endpoints and Socket.IO auth.
- `PORT` defaults to 4000.
- `CORS_ORIGIN` controls allowed origins for browsers.

## Run
- Development (with nodemon):
```bash
npm run dev
```
- Production:
```bash
npm start
```

Open the health endpoint:
- http://localhost:${PORT}/health → `{ "ok": true }`

## Endpoints
- GET `/api/tourists`
- GET `/api/alerts`
- GET `/api/restricted` → `{ polygon: [[lat,lng], ...] }`
- POST `/api/alerts/:id/ack` (Authorization: Bearer API_KEY)
- POST `/api/alerts/:id/resolve` (Authorization: Bearer API_KEY)

## Socket.IO
- Connect with handshake auth `{ token: API_KEY }`
- Events emitted:
  - `tourists:update`
  - `alerts:update`

## Security
- Helmet headers and HSTS
- Rate limiting on all routes
- API key auth for mutating routes and sockets
- Joi validation for IDs
- Morgan access logs for audits
