# 📂 Project Structure

Complete directory structure and file organization for the SafeGuard Tourist Safety Dashboard.

## Directory Tree

```
Tourist-Safety-Dashboard/
│
├── 📁 frontend/                    # Frontend application (client-side)
│   │
│   ├── 📄 index.html              # Landing page with animated background
│   ├── 📄 login.html              # Authentication page
│   ├── 📄 dashboard.html          # Main dashboard with maps and statistics
│   ├── 📄 analytics.html          # Analytics and heatmap visualization
│   ├── 📄 alerts.html             # Emergency alerts management
│   ├── 📄 geofence.html           # Geofencing tools and zone management
│   ├── 📄 audit.html              # Audit logs and activity tracking
│   ├── 📄 efir.html               # E-FIR registration form
│   ├── 📄 settings.html           # User settings and preferences
│   ├── 📄 language.html           # Language selection page
│   ├── 📄 profile.html            # User profile management
│   ├── 📄 help.html               # Help and documentation
│   │
│   ├── 📁 assets/                 # Static assets
│   │   │
│   │   ├── 📁 css/                # Stylesheets
│   │   │   └── 📄 styles.css      # Custom CSS styles
│   │   │
│   │   ├── 📁 js/                 # JavaScript modules
│   │   │   ├── 📄 api.js          # API client and data fetching
│   │   │   ├── 📄 auth.js         # Authentication logic
│   │   │   ├── 📄 dashboard.js    # Dashboard functionality
│   │   │   ├── 📄 map.js          # Map utilities and Mapbox integration
│   │   │   ├── 📄 i18n.js         # Internationalization (9 languages)
│   │   │   ├── 📄 data.js         # Mock data (fallback)
│   │   │   └── 📄 firebase-config.js  # Firebase configuration
│   │   │
│   │   ├── 📁 data/               # Static data files
│   │   │   └── 📄 locations.json  # Police stations and hospitals data
│   │   │
│   │   └── 📁 images/             # Image assets
│   │       └── [various images]
│   │
│   ├── 📁 scripts/                # Development scripts
│   │   ├── 📄 dev.js              # Development server script
│   │   └── 📄 dev-force.js        # Force development mode
│   │
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 package-lock.json       # Dependency lock file
│   └── 📄 DEV-SERVER-GUIDE.md     # Development server guide
│
├── 📁 backend/                     # Backend server (Node.js + Express)
│   │
│   ├── 📄 index.js                # Main server file (Express + Socket.IO)
│   ├── 📄 mockData.js             # Mock data generator
│   ├── 📄 package.json            # Backend dependencies
│   ├── 📄 package-lock.json       # Dependency lock file
│   └── 📄 README.md               # Backend documentation
│
├── 📁 docs/                        # Documentation
│   │
│   ├── 📄 SETUP.md                # Detailed setup guide
│   ├── 📄 ARCHITECTURE.md         # System architecture documentation
│   └── 📄 API.md                  # API reference and documentation
│
├── 📁 .firebase/                   # Firebase cache (gitignored)
├── 📁 .vscode/                     # VS Code settings (gitignored)
├── 📁 .git/                        # Git repository (gitignored)
│
├── 📄 README.md                    # Main project documentation
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # MIT License
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .firebaserc                  # Firebase project configuration
├── 📄 firebase.json                # Firebase hosting configuration
├── 📄 package.json                 # Root package.json
└── 📄 package-lock.json            # Root dependency lock file
```

## File Descriptions

### Frontend Pages

| File | Purpose | Key Features |
|------|---------|--------------|
| `index.html` | Landing page | Animated background, CTA buttons, project overview |
| `login.html` | Authentication | Firebase auth, demo login, form validation |
| `dashboard.html` | Main dashboard | Mapbox maps, police stations, hospitals, statistics |
| `analytics.html` | Analytics | Population heatmaps, risk analysis, demo cases |
| `alerts.html` | Emergency alerts | SOS management, alert acknowledgment, tourist details |
| `geofence.html` | Geofencing | Zone creation (polygon/circle/square), color coding |
| `audit.html` | Audit logs | Activity tracking, user actions, system logs |
| `efir.html` | E-FIR registration | Digital FIR form, PDF export, auto-save |
| `settings.html` | User settings | Profile settings, preferences, notifications |
| `language.html` | Language selection | 9 language options with flag icons |
| `profile.html` | User profile | Profile management, personal information |
| `help.html` | Help documentation | User guides, FAQs, tutorials |

### JavaScript Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `api.js` | API communication | `fetchTourists()`, `fetchAlerts()`, `connectSocket()` |
| `auth.js` | Authentication | `login()`, `logout()`, `checkAuth()`, `getUser()` |
| `dashboard.js` | Dashboard logic | `initMap()`, `updateStats()`, `handleFilters()` |
| `map.js` | Map utilities | `MeghalayaMap` class, marker management, popups |
| `i18n.js` | Internationalization | Translation loading, language switching |
| `data.js` | Mock data | Fallback data when backend unavailable |
| `firebase-config.js` | Firebase setup | Firebase configuration object |

### Backend Files

| File | Purpose | Key Components |
|------|---------|----------------|
| `index.js` | Main server | Express app, Socket.IO, REST API endpoints |
| `mockData.js` | Data generation | Mock tourist data, alerts, zones |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Project overview | Everyone |
| `SETUP.md` | Installation guide | Developers |
| `ARCHITECTURE.md` | System design | Developers, architects |
| `API.md` | API reference | Developers |
| `CONTRIBUTING.md` | Contribution guide | Contributors |
| `PROJECT_STRUCTURE.md` | File organization | Developers |

## Key Technologies

### Frontend
- **HTML5/CSS3/JavaScript** - Core web technologies
- **Tailwind CSS** - Utility-first CSS framework
- **Mapbox GL JS** - Interactive mapping (token: pk.eyJ1IjoicnJvaGl0aGthbm5hYSIsImEiOiJjbWZ0cWFqNzgwOGRqMmlwaG91aHpjbW9oIn0.ULz30NvUuWYgzuxQ_WPLGQ)
- **Firebase** - Authentication and hosting
- **i18next** - Internationalization (9 languages)
- **jsPDF** - PDF generation for E-FIR

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **CORS** - Cross-origin resource sharing

## Data Flow

```
User Browser
    │
    ├─→ Frontend (HTML/CSS/JS)
    │   │
    │   ├─→ Firebase Auth (login/logout)
    │   │
    │   ├─→ Mapbox API (maps and tiles)
    │   │
    │   └─→ Backend API (data)
    │       │
    │       ├─→ REST endpoints
    │       └─→ Socket.IO (real-time)
    │
    └─→ localStorage (settings, language)
```

## Development Workflow

### 1. Start Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:8080
```

### 3. Access Application
```
http://localhost:8080/frontend/
```

## Deployment Structure

### Development
```
Local Machine
├── Frontend: localhost:8080
└── Backend: localhost:4000
```

### Production
```
Firebase Hosting (Frontend)
├── Domain: safeguard-meghalaya.web.app
└── CDN: Global distribution

Cloud Service (Backend)
├── API: api.safeguard-meghalaya.com
└── WebSocket: ws.safeguard-meghalaya.com
```

## File Naming Conventions

### HTML Files
- Lowercase with hyphens: `e-fir.html`, `audit-logs.html`
- Descriptive names: `dashboard.html`, `analytics.html`

### JavaScript Files
- camelCase: `api.js`, `dashboard.js`
- Descriptive: `firebase-config.js`, `language-utils.js`

### CSS Files
- Lowercase: `styles.css`, `custom.css`
- Purpose-based: `dashboard.css`, `auth.css`

### Data Files
- Lowercase with hyphens: `locations.json`, `mock-data.json`
- JSON format for structured data

## Code Organization

### JavaScript Module Pattern
```javascript
// api.js
class API {
  constructor() { }
  async fetchData() { }
}

export default new API();
```

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags -->
  <!-- Stylesheets -->
</head>
<body>
  <!-- Sidebar -->
  <!-- Main content -->
  <!-- Scripts -->
</body>
</html>
```

### CSS Organization
```css
/* Tailwind utilities */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom components */
.custom-component { }

/* Page-specific styles */
.dashboard-specific { }
```

## Asset Management

### Images
- Store in `frontend/assets/images/`
- Use descriptive names: `logo.png`, `map-marker.svg`
- Optimize for web (compress, resize)

### Data Files
- Store in `frontend/assets/data/`
- Use JSON format for structured data
- Document data schema in comments

### Fonts
- Use CDN fonts (Google Fonts, etc.)
- Or store in `frontend/assets/fonts/`

## Version Control

### Branches
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commits
- Follow conventional commits format
- Example: `feat(dashboard): add real-time updates`

## Build Process

### Development
- No build step required
- Direct file serving
- Hot reload with dev server

### Production
- Minify CSS/JS
- Optimize images
- Bundle dependencies
- Deploy to Firebase Hosting

## Maintenance

### Regular Tasks
- Update dependencies: `npm update`
- Security audit: `npm audit`
- Clean cache: `npm cache clean --force`
- Remove unused files

### Backup
- Git repository (GitHub)
- Firebase project backup
- Database exports (when implemented)

## Future Structure Changes

### Planned Additions
```
├── 📁 tests/                      # Test files
│   ├── 📁 unit/                   # Unit tests
│   ├── 📁 integration/            # Integration tests
│   └── 📁 e2e/                    # End-to-end tests
│
├── 📁 database/                   # Database schemas
│   ├── 📄 schema.sql              # SQL schema
│   └── 📄 migrations/             # Database migrations
│
└── 📁 mobile/                     # Mobile app (future)
    ├── 📁 ios/                    # iOS app
    └── 📁 android/                # Android app
```

## Notes

- All frontend files use CDN libraries (no build step)
- Backend uses Node.js modules (requires npm install)
- Firebase configuration required for authentication
- Mapbox token required for maps
- Mock data available when backend is offline

---

**Last Updated**: October 2025  
**Maintained By**: SafeGuard Development Team
