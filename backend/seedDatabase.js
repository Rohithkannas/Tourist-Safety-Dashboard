import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Helper functions for generating realistic data
const firstNames = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Raj', 'Anjali', 'Vikram', 'Pooja', 'Arjun', 'Kavya',
  'John', 'Emma', 'Michael', 'Sophia', 'David', 'Olivia', 'James', 'Isabella', 'Robert', 'Mia',
  'Wei', 'Yuki', 'Hans', 'Marie', 'Carlos', 'Sofia', 'Ahmed', 'Fatima', 'Ivan', 'Natasha',
  'Ravi', 'Lakshmi', 'Suresh', 'Meera', 'Kiran', 'Deepa', 'Anil', 'Sita', 'Vijay', 'Radha'
];

const lastNames = [
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Das', 'Roy', 'Bose',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Chen', 'Wang', 'Li', 'Zhang', 'Liu', 'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber',
  'Devi', 'Rao', 'Iyer', 'Menon', 'Pillai', 'Varma', 'Joshi', 'Desai', 'Mehta', 'Shah'
];

const nationalities = [
  'India', 'USA', 'UK', 'China', 'Japan', 'Germany', 'France', 'Australia', 'Canada', 'Brazil',
  'South Korea', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Singapore',
  'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Bangladesh', 'Nepal', 'Bhutan'
];

const meghalayaLocations = [
  { name: 'Shillong', lat: 25.5788, lng: 91.8933, district: 'East Khasi Hills' },
  { name: 'Cherrapunji', lat: 25.2676, lng: 91.7320, district: 'East Khasi Hills' },
  { name: 'Mawsynram', lat: 25.2958, lng: 91.5831, district: 'East Khasi Hills' },
  { name: 'Tura', lat: 25.5138, lng: 90.2036, district: 'West Garo Hills' },
  { name: 'Jowai', lat: 25.4522, lng: 92.1950, district: 'West Jaintia Hills' },
  { name: 'Nongpoh', lat: 25.9022, lng: 91.8789, district: 'Ri-Bhoi' },
  { name: 'Baghmara', lat: 25.2500, lng: 90.6333, district: 'South Garo Hills' },
  { name: 'Williamnagar', lat: 25.4833, lng: 90.1333, district: 'East Garo Hills' },
  { name: 'Nongstoin', lat: 25.5167, lng: 91.2667, district: 'West Khasi Hills' },
  { name: 'Dawki', lat: 25.1167, lng: 92.0167, district: 'West Jaintia Hills' },
  { name: 'Umiam', lat: 25.6833, lng: 91.9167, district: 'Ri-Bhoi' },
  { name: 'Elephant Falls', lat: 25.5300, lng: 91.8800, district: 'East Khasi Hills' },
  { name: 'Police Bazar', lat: 25.5788, lng: 91.8933, district: 'East Khasi Hills' },
  { name: 'Laitlum Canyon', lat: 25.4500, lng: 91.8000, district: 'East Khasi Hills' },
  { name: 'Living Root Bridge', lat: 25.2500, lng: 91.7000, district: 'East Khasi Hills' }
];

const hotels = [
  'Hotel Pine Borough', 'Ri Kynjai Resort', 'Hotel Polo Towers', 'The Heritage Club',
  'Earle Holiday Home', 'Hotel Centre Point', 'Vivanta Meghalaya', 'Courtyard by Marriott',
  'Hotel Pegasus Crown', 'Hotel Monsoon', 'Shillong Guest House', 'Alpine Continental',
  'Hotel Landmark', 'Tripura Castle', 'Hotel Baba Continental', 'Cafe Shillong Heritage',
  'Ri Kynjai Serenity', 'Polo Orchid Resort', 'The Eee Cee Hotel', 'Hotel Poinisuk'
];

const alertTypes = ['sos', 'medical', 'security', 'weather', 'accident', 'lost', 'theft'];
const riskLevels = ['low', 'medium', 'high', 'critical'];
const alertStatuses = ['pending', 'acknowledged', 'resolved'];

// Random helper functions
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 4) => (Math.random() * (max - min) + min).toFixed(decimals);
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomPhone = () => `+91-${randomInt(70000, 99999)}-${randomInt(10000, 99999)}`;
const randomPassport = () => `${randomElement(['A', 'B', 'C', 'D', 'E'])}${randomInt(1000000, 9999999)}`;
const randomEmail = (name) => `${name.toLowerCase().replace(' ', '.')}@${randomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'])}`;

// Generate tourist data
function generateTourist(id) {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const name = `${firstName} ${lastName}`;
  const location = randomElement(meghalayaLocations);
  const checkInDate = randomDate(new Date(2025, 0, 1), new Date());
  const nationality = randomElement(nationalities);
  
  // Add slight random offset to location for realistic spread
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  
  return {
    id: `T${String(id).padStart(6, '0')}`,
    name,
    firstName,
    lastName,
    nationality,
    passport: randomPassport(),
    phone: randomPhone(),
    email: randomEmail(name),
    age: randomInt(18, 75),
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    location: {
      lat: parseFloat(location.lat) + latOffset,
      lng: parseFloat(location.lng) + lngOffset,
      accuracy: randomInt(5, 50),
      placeName: location.name,
      district: location.district
    },
    status: randomElement(['active', 'active', 'active', 'inactive']), // 75% active
    checkInDate: checkInDate.toISOString(),
    checkOutDate: new Date(checkInDate.getTime() + randomInt(2, 14) * 24 * 60 * 60 * 1000).toISOString(),
    hotel: randomElement(hotels),
    roomNumber: `${randomInt(1, 5)}${randomInt(0, 9)}${randomInt(1, 9)}`,
    emergencyContact: {
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      phone: randomPhone(),
      relation: randomElement(['Spouse', 'Parent', 'Sibling', 'Friend', 'Child'])
    },
    visitedPlaces: Array.from({ length: randomInt(1, 5) }, () => randomElement(meghalayaLocations).name),
    plannedPlaces: Array.from({ length: randomInt(1, 4) }, () => randomElement(meghalayaLocations).name),
    lastSeen: new Date(Date.now() - randomInt(0, 3600000)).toISOString(), // Within last hour
    inRestrictedZone: Math.random() < 0.05, // 5% in restricted zones
    sosActive: Math.random() < 0.02, // 2% with active SOS
    riskScore: randomInt(0, 100),
    travelPurpose: randomElement(['Tourism', 'Business', 'Education', 'Medical', 'Family Visit']),
    groupSize: randomInt(1, 8),
    hasInsurance: Math.random() > 0.3,
    insuranceProvider: Math.random() > 0.3 ? randomElement(['ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz', 'Star Health']) : null,
    createdAt: checkInDate.toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Generate alert data
function generateAlert(id, touristId) {
  const type = randomElement(alertTypes);
  const priority = randomElement(riskLevels);
  const status = randomElement(alertStatuses);
  const location = randomElement(meghalayaLocations);
  const timestamp = randomDate(new Date(2025, 0, 1), new Date());
  
  const messages = {
    sos: 'Emergency assistance needed immediately',
    medical: 'Medical emergency - tourist requires immediate medical attention',
    security: 'Security concern reported by tourist',
    weather: 'Tourist caught in severe weather conditions',
    accident: 'Tourist involved in accident, assistance required',
    lost: 'Tourist reported lost, unable to find way back',
    theft: 'Tourist reported theft of belongings'
  };
  
  return {
    id: `A${String(id).padStart(6, '0')}`,
    touristId,
    type,
    priority,
    status,
    location: {
      lat: parseFloat(location.lat) + (Math.random() - 0.5) * 0.02,
      lng: parseFloat(location.lng) + (Math.random() - 0.5) * 0.02,
      address: `${location.name}, ${location.district}, Meghalaya`,
      district: location.district
    },
    message: messages[type],
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} alert reported at ${location.name}`,
    timestamp: timestamp.toISOString(),
    acknowledgedBy: status !== 'pending' ? `Officer ${randomInt(100, 999)}` : null,
    acknowledgedAt: status !== 'pending' ? new Date(timestamp.getTime() + randomInt(300000, 1800000)).toISOString() : null,
    resolvedBy: status === 'resolved' ? `Officer ${randomInt(100, 999)}` : null,
    resolvedAt: status === 'resolved' ? new Date(timestamp.getTime() + randomInt(1800000, 7200000)).toISOString() : null,
    resolution: status === 'resolved' ? randomElement([
      'Tourist located and safe',
      'Medical assistance provided',
      'Security issue resolved',
      'Tourist escorted to safety',
      'False alarm, no action needed'
    ]) : null,
    responseTime: status !== 'pending' ? randomInt(5, 45) : null, // minutes
    createdAt: timestamp.toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Generate audit log entry
function generateAuditLog(id) {
  const actions = [
    'User Login', 'User Logout', 'Zone Created', 'Zone Updated', 'Zone Deleted',
    'Alert Acknowledged', 'Alert Resolved', 'Tourist Checked In', 'Tourist Checked Out',
    'Profile Updated', 'Settings Changed', 'Report Generated', 'Data Exported'
  ];
  
  const timestamp = randomDate(new Date(2025, 0, 1), new Date());
  const action = randomElement(actions);
  
  return {
    id: `LOG${String(id).padStart(6, '0')}`,
    action,
    userId: `user_${randomInt(1, 50)}`,
    userEmail: `officer${randomInt(1, 50)}@safeguard.gov.in`,
    userName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
    ipAddress: `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`,
    userAgent: randomElement([
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0'
    ]),
    details: {
      action,
      resource: randomElement(['tourist', 'alert', 'zone', 'user', 'report']),
      resourceId: `RES${randomInt(1000, 9999)}`,
      changes: action.includes('Updated') ? { field: 'status', oldValue: 'pending', newValue: 'active' } : null
    },
    timestamp: timestamp.toISOString(),
    success: Math.random() > 0.05, // 95% success rate
    errorMessage: Math.random() < 0.05 ? 'Operation failed due to network error' : null
  };
}

// Generate geofence zone
function generateZone(id) {
  const location = randomElement(meghalayaLocations);
  const types = ['restricted', 'caution', 'safe'];
  const type = randomElement(types);
  const radius = randomInt(500, 5000); // meters
  
  // Generate polygon coordinates (simplified square around center point)
  const offset = radius / 111320; // Convert meters to degrees (approximate)
  
  return {
    id: `Z${String(id).padStart(6, '0')}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Zone ${id}`,
    type,
    shape: randomElement(['polygon', 'circle']),
    center: {
      lat: location.lat,
      lng: location.lng
    },
    radius: radius,
    // Store as GeoJSON-compatible string to avoid nested arrays
    geometry: JSON.stringify({
      type: 'Polygon',
      coordinates: [[
        [location.lng - offset, location.lat - offset],
        [location.lng + offset, location.lat - offset],
        [location.lng + offset, location.lat + offset],
        [location.lng - offset, location.lat + offset],
        [location.lng - offset, location.lat - offset]
      ]]
    }),
    district: location.district,
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} zone near ${location.name}`,
    color: type === 'restricted' ? '#ff0000' : type === 'caution' ? '#ffff00' : '#00ff00',
    active: Math.random() > 0.1, // 90% active
    touristsInside: randomInt(0, 50),
    alertsTriggered: randomInt(0, 20),
    createdBy: `officer${randomInt(1, 50)}@safeguard.gov.in`,
    createdAt: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Generate risk assessment
function generateRiskAssessment(id) {
  const location = randomElement(meghalayaLocations);
  const timestamp = randomDate(new Date(2025, 0, 1), new Date());
  
  return {
    id: `RISK${String(id).padStart(6, '0')}`,
    location: {
      name: location.name,
      district: location.district,
      lat: location.lat,
      lng: location.lng
    },
    riskLevel: randomElement(riskLevels),
    riskScore: randomInt(0, 100),
    factors: {
      weather: randomInt(0, 100),
      crowdDensity: randomInt(0, 100),
      crimeRate: randomInt(0, 100),
      infrastructure: randomInt(0, 100),
      accessibility: randomInt(0, 100)
    },
    populationDensity: randomInt(10, 1000),
    touristCount: randomInt(5, 200),
    activeAlerts: randomInt(0, 10),
    recommendations: [
      'Monitor weather conditions',
      'Increase patrol frequency',
      'Set up temporary checkpoints',
      'Issue travel advisories'
    ].slice(0, randomInt(1, 4)),
    timestamp: timestamp.toISOString(),
    validUntil: new Date(timestamp.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: timestamp.toISOString()
  };
}

// Batch write function
async function batchWrite(collectionName, data, batchSize = 500) {
  console.log(`\n📝 Writing ${data.length} documents to ${collectionName}...`);
  
  let batch = db.batch();
  let count = 0;
  let totalWritten = 0;
  
  for (const item of data) {
    const docRef = db.collection(collectionName).doc(item.id);
    batch.set(docRef, item);
    count++;
    
    if (count === batchSize) {
      await batch.commit();
      totalWritten += count;
      console.log(`   ✅ Written ${totalWritten}/${data.length} documents`);
      batch = db.batch();
      count = 0;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Commit remaining documents
  if (count > 0) {
    await batch.commit();
    totalWritten += count;
    console.log(`   ✅ Written ${totalWritten}/${data.length} documents`);
  }
  
  console.log(`✅ Completed ${collectionName}: ${totalWritten} documents`);
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  console.log(`📊 Project: ${serviceAccount.project_id}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  try {
    // Generate data
    console.log('📦 Generating mock data...\n');
    
    console.log('   Generating 5,000 tourists...');
    const tourists = Array.from({ length: 5000 }, (_, i) => generateTourist(i + 1));
    
    console.log('   Generating 2,000 alerts...');
    const alerts = Array.from({ length: 2000 }, (_, i) => 
      generateAlert(i + 1, tourists[randomInt(0, tourists.length - 1)].id)
    );
    
    console.log('   Generating 1,500 audit logs...');
    const auditLogs = Array.from({ length: 1500 }, (_, i) => generateAuditLog(i + 1));
    
    console.log('   Generating 500 geofence zones...');
    const zones = Array.from({ length: 500 }, (_, i) => generateZone(i + 1));
    
    console.log('   Generating 1,000 risk assessments...');
    const riskAssessments = Array.from({ length: 1000 }, (_, i) => generateRiskAssessment(i + 1));
    
    console.log('\n✅ Mock data generation complete!');
    console.log(`   Total records: ${tourists.length + alerts.length + auditLogs.length + zones.length + riskAssessments.length}`);
    
    // Write to Firestore
    console.log('\n📤 Writing to Firestore...');
    
    await batchWrite('tourists', tourists);
    await batchWrite('alerts', alerts);
    await batchWrite('auditLogs', auditLogs);
    await batchWrite('zones', zones);
    await batchWrite('riskAssessments', riskAssessments);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   👥 Tourists: ${tourists.length}`);
    console.log(`   🚨 Alerts: ${alerts.length}`);
    console.log(`   📋 Audit Logs: ${auditLogs.length}`);
    console.log(`   🔒 Geofence Zones: ${zones.length}`);
    console.log(`   📊 Risk Assessments: ${riskAssessments.length}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   📦 TOTAL: ${tourists.length + alerts.length + auditLogs.length + zones.length + riskAssessments.length} records`);
    console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
    console.log(`\n✅ Your Firebase database is now populated with realistic mock data!`);
    console.log(`\n🔗 View your data at: https://console.firebase.google.com/project/${serviceAccount.project_id}/firestore`);
    
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    // Close the app
    await admin.app().delete();
    process.exit(0);
  }
}

// Run the seeding
seedDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
