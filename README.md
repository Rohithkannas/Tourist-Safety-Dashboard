# Tourist Safety Dashboard (MVP)

A three-page MVP web app for real-time tourist visualization and SOS management.

- Landing with animated 3D clouds (Vanta.js) using blue/black/orange theme
- Login (Firebase Email/Password) with simple redirect
- Map dashboard (Leaflet + clustering) with SOS side panel and profile modal

## Pages
- `index.html` — Landing page with Vanta.js clouds background and CTA
- `login.html` — Email/Password login (Firebase optional) + demo login button
- `dashboard.html` — Map, clusters, restricted zone, SOS list, profile modal

## Tech
- Tailwind (CDN) for styling
- Vanta.js + Three.js for clouds animation
- Leaflet + MarkerCluster for map and clustering
- Optional Firebase (v9 compat) for Auth/DB

## Running Locally
Just open `index.html` in a modern browser. For best results, serve via a local server (to avoid some browsers blocking local file requests).

- VS Code Live Server
- `python -m http.server` (if you have Python)

## Folder Structure
```
Tourist-Safety-Dashboard/
├─ frontend/                # All client-side files (open these in the browser)
│  ├─ index.html
│  ├─ login.html
│  ├─ dashboard.html
│  └─ assets/
│     ├─ css/styles.css
│     └─ js/{api.js, auth.js, data.js, dashboard.js, firebase-config.js}
└─ backend/                 # Node.js Express + Socket.IO server
   ├─ index.js
   ├─ mockData.js
   └─ package.json
```
Legacy root-level HTML files may remain; use the versions under `frontend/` going forward.

### Local Backend (Node + Express + Socket.IO)
This project includes a local backend serving mock realtime data and APIs. The frontend will auto-detect the backend at `http://localhost:4000` and switch from demo mode to backend mode.

1) Install Node dependencies
```
npm install
```

2) Start the backend server (port 4000)
```
npm run start:server
```
Backend health: `GET http://localhost:4000/health`

3) Start or keep your static site server for the frontend
```
# if you don't already have one running (from repo root)
python -m http.server 5500
```

Open the app at: `http://127.0.0.1:5500/frontend/`

The frontend API layer (`assets/js/api.js`) will:
- Ping `/health` on the backend
- If available, fetch initial data and connect via Socket.IO for realtime updates
- Otherwise, fall back to local demo data (`assets/js/data.js`)

### API Endpoints
- `GET /api/tourists` — array of tourists
- `GET /api/alerts` — array of SOS alerts
- `GET /api/restricted` — `{ polygon: [[lat,lng], ...] }`
- `POST /api/alerts/:id/ack` — mark alert acknowledged
- `POST /api/alerts/:id/resolve` — mark alert resolved

### Realtime (Socket.IO events)
- `tourists:update` — emits the full tourists array every few seconds
- `alerts:update` — emits when alert status changes

## Firebase Setup (Optional)
1. Create a Firebase project.
2. Enable Email/Password in Authentication.
3. Create a Web App and copy the config object.
4. Open `assets/js/firebase-config.js` and replace `const cfg = null;` with your config object, e.g.
   ```js
   const cfg = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };
   ```
5. In `login.html`, use your test credentials to sign in. On success you will be redirected to `dashboard.html`.

If you leave `cfg` as `null`, the app runs in DEMO mode using local mock data (`assets/js/data.js`). Use the "Demo without Firebase" button on the login page.

## Notes
- Restricted zone is a demo polygon near Jaipur. Adjust in `assets/js/data.js` (`restrictedPolygon`).
- Colors:
  - Blue: normal
  - Orange: in restricted zone
  - Red: SOS
- Buttons and navigation are wired. Logout clears local session and returns to landing.

## Future Enhancements
- Replace DEMO data with Firestore listeners for tourists and SOS collection
- Audit trail for acknowledge/resolve actions
- Role-based access & granular permissions
- Offline caching and mobile-optimized view
