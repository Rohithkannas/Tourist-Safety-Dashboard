# 🔧 Setup Guide

Complete installation and configuration guide for the SafeGuard Tourist Safety Dashboard.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Firebase Configuration](#firebase-configuration)
- [Mapbox Configuration](#mapbox-configuration)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: 4GB minimum
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

### Recommended Requirements
- **Node.js**: v18.0.0 or higher
- **RAM**: 8GB or more
- **Internet**: Stable broadband connection for map tiles

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Rohithkannas/Tourist-Safety-Dashboard.git
cd Tourist-Safety-Dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (web framework)
- Socket.IO (real-time communication)
- CORS (cross-origin resource sharing)
- Other dependencies listed in `package.json`

### 3. Install Frontend Dependencies (Optional)

The frontend uses CDN-based libraries, but you can install a dev server:

```bash
cd frontend
npm install
```

This installs:
- http-server (for local development)
- Other dev dependencies

## Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `safeguard-tourist-dashboard`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### Step 3: Create Web App

1. In Project Overview, click the **Web** icon (`</>`)
2. Register app with nickname: `SafeGuard Web`
3. Enable Firebase Hosting (optional)
4. Copy the Firebase configuration object

### Step 4: Configure Frontend

1. Open `frontend/assets/js/firebase-config.js`
2. Replace the configuration:

```javascript
// Replace this configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export default firebaseConfig;
```

### Step 5: Create Test User

1. In Firebase Console, go to **Authentication** > **Users**
2. Click "Add User"
3. Email: `demo@safeguard.com`
4. Password: `demo123`
5. Click "Add User"

## Mapbox Configuration

### Step 1: Create Mapbox Account

1. Go to [Mapbox](https://www.mapbox.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Access Token

1. Go to [Account Dashboard](https://account.mapbox.com/)
2. Copy your **Default Public Token**
3. Or create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`

### Step 3: Configure Token

The token is already configured in the project:
```
pk.eyJ1IjoicnJvaGl0aGthbm5hYSIsImEiOiJjbWZ0cWFqNzgwOGRqMmlwaG91aHpjbW9oIn0.ULz30NvUuWYgzuxQ_WPLGQ
```

If you want to use your own token, update it in:
- `frontend/dashboard.html`
- `frontend/analytics.html`
- `frontend/geofence.html`

Search for `mapboxgl.accessToken` and replace the value.

## Backend Setup

### Step 1: Configure Environment

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

### Step 2: Start the Server

```bash
cd backend
npm start
```

You should see:
```
✓ Backend server running on http://localhost:4000
✓ Socket.IO enabled
✓ CORS enabled for http://localhost:8080
```

### Step 3: Test the Backend

Open a browser and navigate to:
```
http://localhost:4000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T05:00:00.000Z"
}
```

## Frontend Setup

### Method 1: Using npm (Recommended)

```bash
cd frontend
npm start
```

This starts a development server on `http://localhost:8080`

### Method 2: Using Python

```bash
cd frontend
python -m http.server 8080
```

### Method 3: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `frontend/index.html`
3. Select "Open with Live Server"

### Method 4: Using Node http-server

```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

## Accessing the Application

1. Open your browser
2. Navigate to `http://localhost:8080/`
3. You should see the landing page
4. Click "Get Started" to go to login
5. Use credentials:
   - Email: `demo@safeguard.com`
   - Password: `demo123`

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Make sure you've installed dependencies
```bash
cd backend
npm install
```

### Issue: Firebase authentication not working

**Solution**: 
1. Check that `firebase-config.js` has correct configuration
2. Verify Email/Password is enabled in Firebase Console
3. Check browser console for specific error messages

### Issue: Maps not loading

**Solution**:
1. Check your internet connection
2. Verify Mapbox token is valid
3. Check browser console for API errors
4. Ensure you haven't exceeded Mapbox free tier limits

### Issue: Backend connection failed

**Solution**:
1. Ensure backend server is running on port 4000
2. Check for port conflicts: `netstat -ano | findstr :4000` (Windows)
3. Verify CORS settings in `backend/index.js`
4. Check firewall settings

### Issue: "Cannot GET /" error

**Solution**: Make sure you're accessing the correct URL
- Correct: `http://localhost:8080/frontend/`
- Incorrect: `http://localhost:8080/`

### Issue: Language not changing

**Solution**:
1. Clear browser cache and localStorage
2. Check browser console for errors
3. Verify `i18n.js` is loaded correctly

### Issue: Geofencing tools not working

**Solution**:
1. Ensure Mapbox GL Draw library is loaded
2. Check browser console for errors
3. Verify you're using a modern browser

## Development Tips

### Hot Reload

For automatic page refresh during development:
```bash
npm install -g browser-sync
browser-sync start --server frontend --files "frontend/**/*"
```

### Debugging

Enable verbose logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```

### Testing Different Languages

1. Go to `http://localhost:8080/frontend/language.html`
2. Select a language
3. Navigate to dashboard to see translations

## Production Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Custom Server

1. Build optimized assets
2. Configure web server (nginx, Apache)
3. Set up SSL certificate
4. Configure domain and DNS
5. Deploy backend to cloud service (Heroku, AWS, etc.)

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Check [API.md](API.md) for backend API documentation
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines

## Support

If you encounter issues not covered here:
1. Check existing GitHub issues
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Screenshots (if applicable)

---

**Need help?** Open an issue on GitHub or contact the development team.
