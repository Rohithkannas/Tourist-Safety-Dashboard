# ⚡ Quick Start Guide

Get SafeGuard up and running in 5 minutes!

## Prerequisites

- ✅ Node.js v14+ installed
- ✅ Git installed
- ✅ Modern web browser

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Rohithkannas/Tourist-Safety-Dashboard.git
cd Tourist-Safety-Dashboard
```

### 2. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for:
- Root project
- Backend server
- Frontend application

### 3. Start Backend Server

```bash
cd backend
npm start
```

✅ Backend running on `http://localhost:4000`

### 4. Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

✅ Frontend running on `http://localhost:8080`

### 5. Open Application

Navigate to: **http://localhost:8080/frontend/**

## Demo Login

Use these credentials to test the application:

- **Email**: `demo@safeguard.com`
- **Password**: `demo123`

## Quick Tour

### 1. Dashboard
- View police stations and hospitals on map
- **Search tourists by ID** - Type tourist ID (e.g., T000001) and press Enter
- Filter by location type
- See real-time statistics from Firestore

### 2. Emergency Alerts
- View active SOS alerts from database (2,000+ alerts)
- **Search tourists** - Find complete tourist details by ID
- Acknowledge and resolve alerts (working buttons)
- View full tourist modal with personal info, location, emergency contact
- All data fetched from Firebase Firestore

## 🎯 Key Features to Test

### 1. Tourist Search (Dashboard)
- Enter tourist ID: `T000001` to `T005000`
- Map flies to location
- Custom marker with details
- Full details modal

### 2. Tourist Search (Alerts Page)
- Search bar in header
- Complete tourist details
- Personal info, location, emergency contact

### 3. AI Risk Prediction (NEW!)
- LSTM-based risk prediction
- Real-time risk assessment
- Hotspot detection
- Color-coded risk levels

### 4. Real Database
- All data from Firestore
- 5,000 tourists
- 2,000 alerts
- 500 zones
- 1,000 risk assessments cases
- Regional analysis

### 4. Geofencing
- Draw safety zones (polygon, circle, square)
- Color code zones (red, yellow, green)
- Manage restricted areas

### 5. E-FIR Registration
- Fill digital FIR form
- Auto-save drafts
- Export to PDF

### 6. Language Selection
- Choose from 9 languages
- Instant translation
- Persistent preference

## Common Commands

```bash
# Start both backend and frontend
npm run dev

# Start backend only
npm run start:backend

# Start frontend only
npm run start:frontend

# Deploy to Firebase
npm run deploy

# Install all dependencies
npm run install:all
```

## Project Structure

```
Tourist-Safety-Dashboard/
├── frontend/          # All HTML pages and assets
├── backend/           # Express server and API
├── docs/              # Documentation
└── README.md          # Full documentation
```

## Key Features

✨ **Interactive Maps** - Mapbox-powered visualization  
🔍 **Tourist Search** - Search by ID and locate on map with GPS  
🚨 **Emergency Alerts** - Real-time SOS management with Firestore  
🔒 **Geofencing** - Safety zone creation  
🏥 **Emergency Services** - 32 police stations, 24 hospitals  
🌐 **Multilingual** - 9 language support  
📊 **Analytics** - Population density heatmaps  
📝 **E-FIR** - Digital FIR registration  
💾 **Real Database** - Firebase Firestore with 10,000+ records  

## Configuration

### Firebase (Optional)

1. Create Firebase project
2. Enable Email/Password authentication
3. Update `frontend/assets/js/firebase-config.js`

### Mapbox

Token already configured:
```
pk.eyJ1IjoicnJvaGl0aGthbm5hYSIsImEiOiJjbWZ0cWFqNzgwOGRqMmlwaG91aHpjbW9oIn0.ULz30NvUuWYgzuxQ_WPLGQ
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
netstat -ano | findstr :4000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend shows blank page
- Ensure backend is running
- Check browser console for errors
- Clear browser cache

### Maps not loading
- Check internet connection
- Verify Mapbox token
- Check browser console

## Testing the New Features

### Tourist Search on Dashboard:
1. Open `http://localhost:8080/frontend/dashboard.html`
2. Type **T000001** in search bar
3. Press Enter
4. Watch map fly to tourist location in Shillong
5. See red pulsing marker with tourist info
6. Click "Details" for full information

### Tourist Search on Alerts Page:
1. Open `http://localhost:8080/frontend/alerts.html`
2. Type **T000001** in search bar
3. Press Enter
4. View complete tourist details modal

### Available Tourist IDs:
- T000001 to T005000 (5,000 tourists in database)
- All have real GPS coordinates from Meghalaya

## Next Steps

📖 Read [SETUP.md](docs/SETUP.md) for detailed configuration  
🏭 Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design  
📡 Review [API.md](docs/API.md) for API reference  
📝 See [CHANGELOG.md](CHANGELOG.md) for recent updates  
🤝 See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute  

## Support

- 📝 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/Rohithkannas/Tourist-Safety-Dashboard/issues)
- 💬 [Discussions](https://github.com/Rohithkannas/Tourist-Safety-Dashboard/discussions)

## License

MIT License - see [LICENSE](LICENSE)

---

**Ready to build?** Start with the [full documentation](README.md)!
