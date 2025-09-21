import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Firebase Initialization ---
let serviceAccount = null;
let firebaseInitialized = false;

try {
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  
  // Check if file exists
  if (!existsSync(serviceAccountPath)) {
    throw new Error('serviceAccountKey.json file not found');
  }
  
  // Read and parse the service account key
  const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountData);
  
  // Validate required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Invalid service account key: missing required fields');
  }
  
  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  firebaseInitialized = true;
  console.log('✅ Firebase Admin SDK initialized successfully');
  console.log(`📊 Project ID: ${serviceAccount.project_id}`);
  console.log(`🔑 Service Account: ${serviceAccount.client_email}`);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.error('   Make sure serviceAccountKey.json exists and contains valid Firebase credentials');
  firebaseInitialized = false;
}

// --- Authentication Middleware ---
const authenticate = async (req, res, next) => {
  // Check if Firebase is initialized
  if (!firebaseInitialized) {
    console.error('❌ Firebase not initialized. Authentication required but unavailable.');
    return res.status(503).json({ 
      success: false, 
      error: 'Service unavailable: Firebase authentication not configured' 
    });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to the request
    console.log(`✅ Authenticated user: ${decodedToken.email || decodedToken.uid}`);
    next();
  } catch (error) {
    console.error('❌ Error verifying Firebase token:', error.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health check endpoint - This route is NOT protected
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    firebase: firebaseInitialized ? 'active' : 'disabled',
    project: serviceAccount?.project_id || 'unknown'
  });
});

// Test Firebase authentication endpoint
app.get('/api/auth/test', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Firebase authentication working perfectly!',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || 'Unknown',
        emailVerified: req.user.email_verified,
        authTime: new Date(req.user.auth_time * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in auth test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process authentication test'
    });
  }
});

// User profile endpoint
app.get('/api/user/profile', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      profile: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name || req.user.email?.split('@')[0] || 'User',
        emailVerified: req.user.email_verified,
        provider: req.user.firebase?.sign_in_provider || 'unknown',
        lastLogin: new Date(req.user.auth_time * 1000).toISOString(),
        isAdmin: req.user.email === 'rohithkanna.ss@gmail.com'
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// --- PROTECTED ROUTES ---

// Get all zones
let zones = [];
let zoneIdCounter = 1;
app.get('/api/zones', authenticate, (req, res) => {
  try {
    res.json({
      success: true,
      data: zones,
      count: zones.length
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zones'
    });
  }
});

// Create a new zone
app.post('/api/zones', authenticate, (req, res) => {
  try {
    const { name, type, geometry, properties } = req.body;
    
    if (!name || !type || !geometry) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, geometry'
      });
    }

    const newZone = {
      id: zoneIdCounter++,
      name,
      type,
      geometry,
      properties: properties || {},
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    zones.push(newZone);

    res.status(201).json({
      success: true,
      data: newZone,
      message: 'Zone created successfully'
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create zone'
    });
  }
});

// Update a zone
app.put('/api/zones/:id', authenticate, (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const { name, type, geometry, properties } = req.body;
    
    const zoneIndex = zones.findIndex(zone => zone.id === zoneId);
    
    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    zones[zoneIndex] = {
      ...zones[zoneIndex],
      name: name || zones[zoneIndex].name,
      type: type || zones[zoneIndex].type,
      geometry: geometry || zones[zoneIndex].geometry,
      properties: properties || zones[zoneIndex].properties,
      updatedBy: req.user.email,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: zones[zoneIndex],
      message: 'Zone updated successfully'
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update zone'
    });
  }
});

// Delete a zone
app.delete('/api/zones/:id', authenticate, (req, res) => {
  try {
    const zoneId = parseInt(req.params.id);
    const zoneIndex = zones.findIndex(zone => zone.id === zoneId);
    
    if (zoneIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    const deletedZone = zones.splice(zoneIndex, 1)[0];

    res.json({
      success: true,
      data: deletedZone,
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete zone'
    });
  }
});

// Get tourist data (mock endpoint)
app.get('/api/tourists', authenticate, (req, res) => {
  try {
    const mockTourists = [
      {
        id: 1,
        name: "Tourist Group A",
        location: { lng: 91.8800, lat: 25.5700 },
        count: 8,
        status: "active",
        lastUpdate: new Date().toISOString()
      },
      {
        id: 2,
        name: "Tourist Group B",
        location: { lng: 91.3500, lat: 25.4600 },
        count: 12,
        status: "active",
        lastUpdate: new Date().toISOString()
      },
      {
        id: 3,
        name: "Tourist Group C",
        location: { lng: 91.1900, lat: 25.2800 },
        count: 25,
        status: "active",
        lastUpdate: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockTourists,
      count: mockTourists.length
    });
  } catch (error) {
    console.error('Error fetching tourists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tourist data'
    });
  }
});

// Get risk alerts (mock endpoint)
app.get('/api/alerts', authenticate, (req, res) => {
  try {
    const mockAlerts = [
      {
        id: 1,
        region: "East Khasi Hills",
        riskLevel: "high",
        message: "Flash flood warning in effect. Heavy rainfall expected.",
        touristsAffected: 12,
        updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      },
      {
        id: 2,
        region: "West Garo Hills",
        riskLevel: "medium",
        message: "Road construction ongoing. Traffic delays expected.",
        touristsAffected: 5,
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      },
      {
        id: 3,
        region: "South West Khasi Hills",
        riskLevel: "low",
        message: "All clear. Normal tourist activities can proceed.",
        touristsAffected: 45,
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
      }
    ];

    res.json({
      success: true,
      data: mockAlerts,
      count: mockAlerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Tourist Safety Dashboard Backend`);
  console.log(`📍 Server running on http://localhost:${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  // Firebase status
  if (firebaseInitialized) {
    console.log(`\n🔐 Firebase Authentication: ACTIVE`);
    console.log(`📊 Project: ${serviceAccount.project_id}`);
    console.log(`🔑 Service Account: ${serviceAccount.client_email}`);
    console.log(`👤 Admin User: rohithkanna.ss@gmail.com`);
  } else {
    console.log(`\n❌ Firebase Authentication: DISABLED`);
    console.log(`⚠️  Protected endpoints will return 503 Service Unavailable`);
  }
  
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /api/health        - Health check (Public)`);
  console.log(`   GET  /api/auth/test     - Test Firebase auth (Protected)`);
  console.log(`   GET  /api/user/profile  - Get user profile (Protected)`);
  console.log(`   GET  /api/zones         - Get all zones (Protected)`);
  console.log(`   POST /api/zones         - Create new zone (Protected)`);
  console.log(`   PUT  /api/zones/:id     - Update zone (Protected)`);
  console.log(`   DEL  /api/zones/:id     - Delete zone (Protected)`);
  console.log(`   GET  /api/tourists      - Get tourist data (Protected)`);
  console.log(`   GET  /api/alerts        - Get risk alerts (Protected)`);
});

export default app;