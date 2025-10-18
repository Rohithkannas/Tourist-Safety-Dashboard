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

// Get Firestore instance
const db = firebaseInitialized ? admin.firestore() : null;

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

// Get all zones from Firestore
app.get('/api/zones', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const zonesSnapshot = await db.collection('zones').get();
    const zones = [];
    
    zonesSnapshot.forEach(doc => {
      zones.push({ ...doc.data(), firestoreId: doc.id });
    });

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

// Create a new zone in Firestore
app.post('/api/zones', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const { name, type, geometry, properties, center, radius, district, color } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type'
      });
    }

    const newZone = {
      name,
      type,
      geometry: typeof geometry === 'string' ? geometry : JSON.stringify(geometry),
      properties: properties || {},
      center: center || null,
      radius: radius || 0,
      district: district || 'Unknown',
      color: color || '#ff0000',
      active: true,
      touristsInside: 0,
      alertsTriggered: 0,
      createdBy: req.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('zones').add(newZone);
    newZone.id = docRef.id;

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

// Update a zone in Firestore
app.put('/api/zones/:id', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const zoneId = req.params.id;
    const { name, type, geometry, properties, active } = req.body;
    
    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();
    
    if (!zoneDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    const updateData = {
      updatedBy: req.user.email,
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (geometry) updateData.geometry = typeof geometry === 'string' ? geometry : JSON.stringify(geometry);
    if (properties) updateData.properties = properties;
    if (active !== undefined) updateData.active = active;

    await zoneRef.update(updateData);
    const updatedZone = { ...zoneDoc.data(), ...updateData, id: zoneId };

    res.json({
      success: true,
      data: updatedZone,
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

// Delete a zone from Firestore
app.delete('/api/zones/:id', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const zoneId = req.params.id;
    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();
    
    if (!zoneDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found'
      });
    }

    const deletedZone = { ...zoneDoc.data(), id: zoneId };
    await zoneRef.delete();

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

// Get tourists from Firestore
app.get('/api/tourists', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const { status, limit = 50 } = req.query;
    let query = db.collection('tourists');

    // Apply filters
    if (status) query = query.where('status', '==', status);

    // Limit results
    query = query.limit(parseInt(limit));

    const touristsSnapshot = await query.get();
    const tourists = [];
    
    touristsSnapshot.forEach(doc => {
      tourists.push({ ...doc.data(), firestoreId: doc.id });
    });

    res.json({
      success: true,
      data: tourists,
      count: tourists.length
    });
  } catch (error) {
    console.error('Error fetching tourists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tourists'
    });
  }
});

// Get single tourist by ID
app.get('/api/tourists/:id', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const touristId = req.params.id;
    
    // Query by tourist ID field (not Firestore document ID)
    const touristsSnapshot = await db.collection('tourists')
      .where('id', '==', touristId)
      .limit(1)
      .get();

    if (touristsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    const touristDoc = touristsSnapshot.docs[0];
    const tourist = { ...touristDoc.data(), firestoreId: touristDoc.id };

    res.json({
      success: true,
      data: tourist
    });
  } catch (error) {
    console.error('Error fetching tourist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tourist details'
    });
  }
});

// Get alerts from Firestore
app.get('/api/alerts', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const { priority, status, type, limit = 100 } = req.query;
    let query = db.collection('alerts');

    // Apply filters
    if (priority) query = query.where('priority', '==', priority);
    if (status) query = query.where('status', '==', status);
    if (type) query = query.where('type', '==', type);

    // Order by timestamp descending and limit
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

    const alertsSnapshot = await query.get();
    const alerts = [];
    
    alertsSnapshot.forEach(doc => {
      alerts.push({ ...doc.data(), firestoreId: doc.id });
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// Get risk assessments from Firestore
app.get('/api/risk-assessments', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const { district, riskLevel, limit = 100 } = req.query;
    let query = db.collection('riskAssessments');

    // Apply filters
    if (district) query = query.where('location.district', '==', district);
    if (riskLevel) query = query.where('riskLevel', '==', riskLevel);

    query = query.limit(parseInt(limit));

    const assessmentsSnapshot = await query.get();
    const assessments = [];
    
    assessmentsSnapshot.forEach(doc => {
      assessments.push({ ...doc.data(), firestoreId: doc.id });
    });

    res.json({
      success: true,
      data: assessments,
      count: assessments.length
    });
  } catch (error) {
    console.error('Error fetching risk assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk assessments'
    });
  }
});

// Get audit logs from Firestore
app.get('/api/audit-logs', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const { action, userId, limit = 100 } = req.query;
    let query = db.collection('auditLogs');

    // Apply filters
    if (action) query = query.where('action', '==', action);
    if (userId) query = query.where('userId', '==', userId);

    // Order by timestamp descending
    query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

    const logsSnapshot = await query.get();
    const logs = [];
    
    logsSnapshot.forEach(doc => {
      logs.push({ ...doc.data(), firestoreId: doc.id });
    });

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    });
  }
});

// Create audit log
app.post('/api/audit-logs', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const logData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('auditLogs').add(logData);
    logData.id = docRef.id;

    res.status(201).json({
      success: true,
      data: logData,
      message: 'Audit log created successfully'
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create audit log'
    });
  }
});

// Update alert status
app.put('/api/alerts/:id', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    const alertId = req.params.id;
    const { status, acknowledgedBy, resolvedBy } = req.body;
    
    const alertRef = db.collection('alerts').doc(alertId);
    const alertDoc = await alertRef.get();
    
    if (!alertDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (acknowledgedBy) updateData.acknowledgedBy = acknowledgedBy;
    if (resolvedBy) updateData.resolvedBy = resolvedBy;

    await alertRef.update(updateData);
    const updatedAlert = { ...alertDoc.data(), ...updateData, id: alertId };

    res.json({
      success: true,
      data: updatedAlert,
      message: 'Alert updated successfully'
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert'
    });
  }
});

// Get dashboard statistics
app.get('/api/statistics', authenticate, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ success: false, error: 'Database not available' });
    }

    // Get counts from each collection
    const [touristsSnapshot, alertsSnapshot, zonesSnapshot] = await Promise.all([
      db.collection('tourists').get(),
      db.collection('alerts').get(),
      db.collection('zones').get()
    ]);

    // Calculate statistics
    let activeTourists = 0;
    let touristsInRestrictedZones = 0;
    let sosAlerts = 0;
    
    touristsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active') activeTourists++;
      if (data.inRestrictedZone) touristsInRestrictedZones++;
      if (data.sosActive) sosAlerts++;
    });

    let pendingAlerts = 0;
    let criticalAlerts = 0;
    
    alertsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'pending') pendingAlerts++;
      if (data.priority === 'critical') criticalAlerts++;
    });

    let activeZones = 0;
    let restrictedZones = 0;
    
    zonesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.active) activeZones++;
      if (data.type === 'restricted') restrictedZones++;
    });

    res.json({
      success: true,
      statistics: {
        tourists: {
          total: touristsSnapshot.size,
          active: activeTourists,
          inactive: touristsSnapshot.size - activeTourists,
          inRestrictedZones: touristsInRestrictedZones,
          withSOS: sosAlerts
        },
        alerts: {
          total: alertsSnapshot.size,
          pending: pendingAlerts,
          critical: criticalAlerts,
          resolved: alertsSnapshot.size - pendingAlerts
        },
        zones: {
          total: zonesSnapshot.size,
          active: activeZones,
          restricted: restrictedZones,
          inactive: zonesSnapshot.size - activeZones
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
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
  console.log(`   GET  /api/health             - Health check (Public)`);
  console.log(`   GET  /api/auth/test          - Test Firebase auth (Protected)`);
  console.log(`   GET  /api/user/profile       - Get user profile (Protected)`);
  console.log(`   GET  /api/statistics         - Get dashboard statistics (Protected)`);
  console.log(`   GET  /api/zones              - Get all zones (Protected)`);
  console.log(`   POST /api/zones              - Create new zone (Protected)`);
  console.log(`   PUT  /api/zones/:id          - Update zone (Protected)`);
  console.log(`   DEL  /api/zones/:id          - Delete zone (Protected)`);
  console.log(`   GET  /api/tourists           - Get tourist data (Protected)`);
  console.log(`   GET  /api/tourists/:id       - Get tourist by ID (Protected)`);
  console.log(`   GET  /api/alerts             - Get alerts (Protected)`);
  console.log(`   PUT  /api/alerts/:id         - Update alert (Protected)`);
  console.log(`   GET  /api/risk-assessments   - Get risk assessments (Protected)`);
  console.log(`   GET  /api/audit-logs         - Get audit logs (Protected)`);
  console.log(`   POST /api/audit-logs         - Create audit log (Protected)`);
});

export default app;