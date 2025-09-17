# Tourist Safety Backend

A Node.js Express + Socket.IO server providing realtime tourist and alert data.

## Requirements
- Node.js 18+
- npm
- (Optional) MongoDB for production session store

## Installation
```bash
cd backend
npm install
```

## Configuration
Create environment variables (e.g., in a `.env` you load via your process manager). Defaults are shown below:
```
PORT=4000
API_KEY=dev-key
NODE_ENV=development
SESSION_SECRET=change-this-in-prod
# Comma-separated allowed origins for web clients
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
# Optional: use MongoDB-backed session store in production
MONGO_URL=mongodb://localhost:27017/tsd
```

- `SESSION_SECRET` secures the session cookie; must be long, random, and rotated.
- `FRONTEND_ORIGINS` must list exact origins allowed for browsers.
- `MONGO_URL` is recommended in production to persist sessions across restarts.

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

## Auth & Sessions
This backend now uses cookie-based sessions, CSRF protection, MFA (TOTP), RBAC, and account lockout.

- CSRF token endpoint: `GET /csrf-token` or `GET /auth/csrf`
  - Include returned token in header `x-csrf-token` for all state-changing requests (POST/PUT/PATCH/DELETE).
- Register: `POST /auth/register` `{ email, password, role? }`
- Login: `POST /auth/login` `{ email, password, token? }` (token is MFA code if enabled)
- Logout: `POST /auth/logout`
- Current user: `GET /auth/me`
- MFA setup: `POST /auth/mfa/setup` → returns `otpauthUrl` and `qrDataUrl`
- MFA verify: `POST /auth/mfa/verify` `{ token }`

Password policy enforced via Joi:
- 10–128 chars, must contain upper, lower, digit, and symbol.

Account lockout:
- After 5 failed attempts, the account is locked for 15 minutes.

RBAC:
- Roles: `admin`, `operator`, `viewer`. Mutating alert routes require `admin` or `operator` (or legacy API key).

## Endpoints
- GET `/api/tourists`
- GET `/api/alerts`
- GET `/api/restricted` → `{ polygon: [[lat,lng], ...] }`
- POST `/api/alerts/:id/ack` (Requires session with role or `Authorization: Bearer API_KEY`)
- POST `/api/alerts/:id/resolve` (Requires session with role or `Authorization: Bearer API_KEY`)

## Socket.IO
- Connect from approved origins. Optionally include handshake auth `{ token: API_KEY }` if using API key mode.
- Events emitted:
  - `tourists:update`
  - `alerts:update`

## Security
- Helmet headers (HSTS, frameguard, referrer policy, CSP, etc.)
- Rate limiting on all routes
- Session-based auth with secure cookies
- CSRF protection for state-changing requests
- Argon2 password hashing, MFA (TOTP), RBAC, account lockout
- Joi validation for inputs
- Morgan access logs (extend with Winston for SIEM)

## Next Steps (Infra & Compliance)
- Terminate TLS 1.3 at the reverse proxy (nginx/CloudFront) and enable HSTS preload.
- Consider mTLS for internal services. Place a WAF in front of the app.
- Configure IDS/IPS and network segmentation; expose only required ports.
- Add SSO (OIDC/SAML) via a provider (e.g., Azure AD/Okta) if needed.
- Add SCA/SBOM tooling (e.g., Syft/Grype) and CI checks (`npm audit`, `npm ci`).
- Document incident response runbooks and enable centralized logging (Winston → file/HTTP → SIEM).
