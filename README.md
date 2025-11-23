# 🛡️ SafeGuard - Tourist Safety Dashboard

> A comprehensive real-time tourist safety management system for Meghalaya, India.
>
> <p align="center">
  <img src="https://github.com/Rohithkannas/Tourist-Safety-Dashboard/blob/cdaff63a624208a54d8083bdd40b5f0d8b2b4ca4/ToursistDashboardCoverPage.png" alt="SafeGuard Dashboard Banner" width="100%">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-000000?logo=mapbox&logoColor=white)](https://www.mapbox.com/)

## 📋 Overview

SafeGuard is a modern web application designed to enhance tourist safety in Meghalaya through real-time monitoring, emergency alerts, geofencing, and multilingual support. The system provides comprehensive tools for authorities to manage tourist safety zones, track emergency situations, and coordinate with local police stations and hospitals.

### ✨ Key Features

- **🗺️ Interactive Mapping**: Mapbox-powered maps with real-time location tracking
- **🔍 Tourist Search**: Search tourists by ID and locate them on map with GPS coordinates
- **🚨 Emergency Alerts**: Real-time SOS alert management with Firestore integration
- **🔒 Geofencing**: Create and manage safety zones (restricted, caution, safe areas)
- **🏥 Emergency Services**: Interactive map of police stations and hospitals across Meghalaya
- **🌐 Multilingual Support**: 9 languages including English, Hindi, Assamese, Bengali, Nepali, and more
- **📊 Analytics Dashboard**: Population density heatmaps and risk assessment tools
- **🧠 AI Risk Prediction**: LSTM-based machine learning for predicting tourist safety risks
- **📝 E-FIR Registration**: Digital FIR filing system with PDF export
- **🔐 Authentication**: Firebase-based secure authentication system
- **📱 Responsive Design**: Mobile-first design with dark theme
- **💾 Real-time Database**: Firebase Firestore integration with 10,000+ records

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Firebase account (optional, for authentication)
- Mapbox account (for map features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rohithkannas/Tourist-Safety-Dashboard.git
   cd Tourist-Safety-Dashboard
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies** (optional, for dev server)
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Firebase** (optional)
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Copy your Firebase config to `frontend/assets/js/firebase-config.js`

5. **Start the backend server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:4000
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm start
   # Or use any static file server
   # python -m http.server 8080
   # Or VS Code Live Server extension
   ```

7. **Open the application**
   - Navigate to `http://localhost:8080/frontend/` (or your server URL)
   - Default demo credentials: `demo@safeguard.com` / `demo123`

## 📁 Project Structure

```
Tourist-Safety-Dashboard/
├── frontend/                    # Frontend application
│   ├── index.html              # Landing page
│   ├── login.html              # Authentication page
│   ├── dashboard.html          # Main dashboard
│   ├── analytics.html          # Analytics & heatmaps
│   ├── alerts.html             # Emergency alerts management
│   ├── geofence.html           # Geofencing tools
│   ├── audit.html              # Audit logs
│   ├── efir.html               # E-FIR registration
│   ├── settings.html           # User settings
│   ├── language.html           # Language selection
│   └── assets/
│       ├── css/                # Stylesheets
│       ├── js/                 # JavaScript modules
│       │   ├── api.js          # API client
│       │   ├── auth.js         # Authentication
│       │   ├── dashboard.js    # Dashboard logic
│       │   ├── map.js          # Map utilities
│       │   ├── i18n.js         # Internationalization
│       │   └── firebase-config.js
│       ├── data/               # Static data files
│       └── images/             # Image assets
│
├── backend/                     # Backend server
│   ├── index.js                # Express server
│   ├── mockData.js             # Mock data generator
│   └── package.json
│
├── docs/                        # Documentation
│   ├── SETUP.md                # Detailed setup guide
│   ├── ARCHITECTURE.md         # System architecture
│   └── API.md                  # API documentation
│
├── .gitignore
├── .firebaserc                 # Firebase configuration
├── firebase.json               # Firebase hosting config
├── package.json
└── README.md                   # This file
```

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- Mapbox GL JS
- Firebase
- i18next
- jsPDF

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Socket.IO
- CORS
- **Socket.IO** - Real-time communication
- **CORS** - Cross-origin resource sharing

## 📖 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed installation and configuration
- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Documentation](docs/API.md) - Backend API reference
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

## 🌐 Supported Languages

- 🇬🇧 English
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Assamese (অসমীয়া)
- 🇮🇳 Bengali (বাংলা)
- 🇳🇵 Nepali (नेपाली)
- 🇨🇳 Mandarin Chinese (中文)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇮🇳 Meitei (মৈতৈলোন্)

## 🔑 Key Components

### Dashboard
- Real-time tourist location tracking
- **Tourist search with map location** - Search by ID and locate on map
- Police stations and hospitals map (32 stations, 24 hospitals)
- Emergency alert notifications
- Quick statistics overview
- Custom markers with popups and full details modal

### Analytics
- Population density heatmaps
- Risk assessment tools
- Regional risk analysis
- Historical data visualization

### Geofencing
- Interactive zone creation (polygon, circle, square)
- Color-coded zones (red=restricted, yellow=caution, green=safe)
- Zone management and storage
- Regional risk alerts

### Emergency Alerts
- Real-time SOS notifications from Firestore
- **Tourist search functionality** - Search and view complete tourist details
- Alert acknowledgment and resolution (working buttons)
- Tourist details modal with personal info, location, emergency contact
- Risk assessment overview with real statistics
- All data fetched from Firebase database (2,000+ alerts)

## 🔒 Security

- Firebase Authentication with email/password
- Secure API endpoints
- CORS configuration
- Session management
- Input validation and sanitization

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Developed for tourist safety management in Meghalaya, India.

## 🙏 Acknowledgments

- Mapbox for mapping services
- Firebase for authentication and hosting
- OpenStreetMap contributors
- Tailwind CSS team

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your Contact Information]

## 🗺️ Roadmap

- [x] Firebase Firestore integration
- [x] Tourist search with map location
- [x] Real-time alert management
- [x] LSTM-based AI risk prediction system
- [ ] Mobile application (iOS/Android)
- [ ] Integration with local emergency services
- [ ] Offline mode support
- [ ] SMS/WhatsApp alert integration
- [ ] Tourist mobile app companion
- [ ] Real-time ML model retraining

---

**Made with ❤️ for safer tourism in Meghalaya**
