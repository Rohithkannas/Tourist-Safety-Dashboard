# 🏗️ System Architecture

Technical architecture and design documentation for the SafeGuard Tourist Safety Dashboard.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Component Details](#component-details)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)

## Overview

SafeGuard is a client-server web application built with modern web technologies. The system follows a modular architecture with clear separation between frontend presentation, backend business logic, and external services.

### Architecture Principles

- **Modularity**: Components are loosely coupled and highly cohesive
- **Scalability**: Designed to handle growing user base and data volume
- **Security**: Multiple layers of authentication and authorization
- **Performance**: Optimized for fast loading and real-time updates
- **Maintainability**: Clean code structure with comprehensive documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │  Login   │  │Dashboard │  │Analytics │   │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Frontend)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Firebase     │  │   Backend API   │  │    Mapbox      │
│ Authentication │  │  (Express.js)   │  │   Services     │
└────────────────┘  └────────┬────────┘  └────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Socket.IO     │
                    │  (Real-time)    │
                    └─────────────────┘
```

## Frontend Architecture

### Technology Stack

- **HTML5/CSS3**: Structure and styling
- **Vanilla JavaScript**: Core logic (ES6+)
- **Tailwind CSS**: Utility-first styling
- **Mapbox GL JS**: Interactive maps
- **Firebase SDK**: Authentication
- **i18next**: Internationalization

### Directory Structure

```
frontend/
├── index.html              # Landing page
├── login.html              # Authentication
├── dashboard.html          # Main dashboard
├── analytics.html          # Analytics & heatmaps
├── alerts.html             # Emergency alerts
├── geofence.html           # Geofencing tools
├── audit.html              # Audit logs
├── efir.html               # E-FIR registration
├── settings.html           # User settings
├── language.html           # Language selection
├── profile.html            # User profile
├── help.html               # Help documentation
│
└── assets/
    ├── css/
    │   └── styles.css      # Custom styles
    │
    ├── js/
    │   ├── api.js          # API client & data fetching
    │   ├── auth.js         # Authentication logic
    │   ├── dashboard.js    # Dashboard functionality
    │   ├── map.js          # Map utilities & helpers
    │   ├── i18n.js         # Internationalization
    │   ├── data.js         # Mock data (fallback)
    │   └── firebase-config.js  # Firebase configuration
    │
    ├── data/
    │   └── locations.json  # Police stations & hospitals
    │
    └── images/
        └── [image assets]
```

### Module Responsibilities

#### api.js
- Backend API communication
- HTTP request handling
- Socket.IO connection management
- Error handling and retries
- Fallback to mock data

```javascript
// API Module Structure
class API {
  constructor() {
    this.baseURL = 'http://localhost:4000';
    this.socket = null;
  }
  
  async fetchTourists() { /* ... */ }
  async fetchAlerts() { /* ... */ }
  connectSocket() { /* ... */ }
}
```

#### auth.js
- Firebase authentication
- Session management
- Login/logout functionality
- User state persistence
- Route protection

```javascript
// Auth Module Structure
class Auth {
  constructor() {
    this.currentUser = null;
  }
  
  async login(email, password) { /* ... */ }
  async logout() { /* ... */ }
  checkAuth() { /* ... */ }
}
```

#### dashboard.js
- Dashboard initialization
- Map rendering
- Data visualization
- Event handlers
- UI updates

#### map.js
- Mapbox map initialization
- Marker management
- Popup creation
- Layer control
- Geofencing utilities

#### i18n.js
- Language detection
- Translation loading
- Dynamic text updates
- Language switching
- Locale persistence

### Page Flow

```
Landing Page (index.html)
    │
    ├─→ Get Started
    │
    ▼
Login Page (login.html)
    │
    ├─→ Firebase Auth
    │
    ▼
Language Selection (language.html)
    │
    ├─→ Select Language
    │
    ▼
Dashboard (dashboard.html)
    │
    ├─→ Analytics
    ├─→ Alerts
    ├─→ Geofence
    ├─→ Audit
    ├─→ E-FIR
    ├─→ Settings
    └─→ Profile
```

## Backend Architecture

### Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time communication
- **CORS**: Cross-origin support

### Directory Structure

```
backend/
├── index.js            # Main server file
├── mockData.js         # Mock data generator
├── package.json        # Dependencies
└── README.md           # Backend documentation
```

### Server Architecture

```javascript
// Server Structure
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());

// REST API Routes
app.get('/api/tourists', getTourists);
app.get('/api/alerts', getAlerts);
app.post('/api/alerts/:id/ack', acknowledgeAlert);
app.post('/api/alerts/:id/resolve', resolveAlert);

// Socket.IO Events
io.on('connection', (socket) => {
  // Real-time updates
  setInterval(() => {
    socket.emit('tourists:update', mockData.tourists);
  }, 5000);
});
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/tourists` | Get all tourists |
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/restricted` | Get restricted zones |
| POST | `/api/alerts/:id/ack` | Acknowledge alert |
| POST | `/api/alerts/:id/resolve` | Resolve alert |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connection` | Client → Server | Client connects |
| `disconnect` | Client → Server | Client disconnects |
| `tourists:update` | Server → Client | Tourist data update |
| `alerts:update` | Server → Client | Alert status change |

## Data Flow

### Authentication Flow

```
User → Login Form → Firebase Auth → Token → Frontend
                                      │
                                      ├─→ Store in localStorage
                                      └─→ Redirect to Dashboard
```

### Data Fetching Flow

```
Dashboard Load
    │
    ├─→ Check Backend Health
    │   │
    │   ├─→ Success: Fetch from Backend
    │   │   │
    │   │   ├─→ GET /api/tourists
    │   │   ├─→ GET /api/alerts
    │   │   └─→ Connect Socket.IO
    │   │
    │   └─→ Failure: Use Mock Data
    │       └─→ Load from data.js
    │
    └─→ Render Dashboard
```

### Real-time Update Flow

```
Backend Timer (5s)
    │
    ├─→ Generate Mock Data
    │
    ├─→ Emit Socket Event
    │   └─→ 'tourists:update'
    │
    └─→ Frontend Receives
        │
        ├─→ Update Map Markers
        ├─→ Update Statistics
        └─→ Update Alert List
```

## Component Details

### Dashboard Component

**Responsibilities:**
- Display tourist locations on map
- Show police stations and hospitals
- Display real-time statistics
- Handle emergency alerts

**Key Features:**
- Mapbox GL JS integration
- Custom markers for different entity types
- Interactive popups with details
- Filter by location type
- Real-time data updates

### Analytics Component

**Responsibilities:**
- Population density visualization
- Risk assessment analysis
- Historical data trends
- High-density risk cases

**Key Features:**
- Heatmap visualization
- Color-coded density levels
- Interactive risk case cards
- Regional analysis tools

### Geofencing Component

**Responsibilities:**
- Create safety zones
- Manage zone types
- Store zone data
- Display regional alerts

**Key Features:**
- Drawing tools (polygon, circle, square)
- Color-coded zones (red, yellow, green)
- Zone editing and deletion
- Zone persistence in localStorage

### Alerts Component

**Responsibilities:**
- Display emergency alerts
- Manage alert status
- Show tourist details
- Risk assessment overview

**Key Features:**
- Real-time alert notifications
- Alert acknowledgment
- Alert resolution
- Priority-based sorting

### E-FIR Component

**Responsibilities:**
- Digital FIR registration
- Form validation
- PDF generation
- Data persistence

**Key Features:**
- Multi-section form
- Auto-save to localStorage
- PDF export with jsPDF
- File upload support

## Security Architecture

### Authentication Layer

```
User Credentials
    │
    ├─→ Firebase Authentication
    │   │
    │   ├─→ Email/Password validation
    │   ├─→ Token generation
    │   └─→ Session management
    │
    └─→ Frontend receives token
        │
        ├─→ Store in localStorage
        └─→ Include in API requests
```

### Authorization

- **Route Protection**: Unauthenticated users redirected to login
- **Session Validation**: Check auth state on page load
- **Token Expiry**: Handle expired tokens gracefully

### Data Security

- **Input Validation**: Sanitize user inputs
- **XSS Prevention**: Escape HTML content
- **CORS**: Restrict API access to known origins
- **HTTPS**: Enforce secure connections (production)

## Deployment Architecture

### Development Environment

```
Local Machine
├── Frontend: http://localhost:8080
└── Backend: http://localhost:4000
```

### Production Environment

```
Cloud Infrastructure
├── Frontend: Firebase Hosting
│   ├── CDN Distribution
│   └── SSL Certificate
│
└── Backend: Cloud Service (Heroku/AWS)
    ├── Load Balancer
    ├── Application Servers
    └── Database (Future)
```

### Deployment Flow

```
Git Repository
    │
    ├─→ Push to main branch
    │
    ├─→ CI/CD Pipeline
    │   │
    │   ├─→ Run tests
    │   ├─→ Build assets
    │   └─→ Deploy
    │
    └─→ Production
        │
        ├─→ Frontend → Firebase Hosting
        └─→ Backend → Cloud Service
```

## Performance Optimization

### Frontend Optimizations

- **Lazy Loading**: Load resources on demand
- **Code Splitting**: Separate vendor and app code
- **Image Optimization**: Compress and resize images
- **Caching**: Leverage browser caching
- **Minification**: Minify CSS and JavaScript

### Backend Optimizations

- **Connection Pooling**: Reuse database connections
- **Caching**: Cache frequently accessed data
- **Compression**: Gzip response compression
- **Rate Limiting**: Prevent API abuse

### Map Optimizations

- **Tile Caching**: Cache map tiles
- **Marker Clustering**: Group nearby markers
- **Lazy Rendering**: Render visible area only
- **Debouncing**: Limit update frequency

## Monitoring and Logging

### Frontend Monitoring

- Browser console errors
- Performance metrics
- User interaction tracking
- Error boundary implementation

### Backend Monitoring

- Server health checks
- API response times
- Error logging
- Socket connection status

## Future Enhancements

### Planned Architecture Changes

1. **Database Integration**
   - Replace mock data with real database
   - Implement Firestore or PostgreSQL
   - Add data persistence layer

2. **Microservices**
   - Split backend into microservices
   - Separate authentication service
   - Dedicated notification service

3. **Mobile Apps**
   - React Native mobile app
   - Shared API backend
   - Push notifications

4. **Advanced Analytics**
   - Machine learning integration
   - Predictive risk analysis
   - Historical trend analysis

5. **Scalability**
   - Horizontal scaling
   - Load balancing
   - CDN integration
   - Database sharding

---

**Last Updated**: October 2025
