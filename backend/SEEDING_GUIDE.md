# 🌱 Database Seeding Guide

Complete guide to populate your Firebase Firestore database with 10,000 realistic mock data records.

## 📋 Overview

The seeding script (`seedDatabase.js`) will populate your Firebase Firestore with:

- **5,000 Tourists** - Realistic tourist data with locations across Meghalaya
- **2,000 Alerts** - Emergency alerts (SOS, medical, security, weather, etc.)
- **1,500 Audit Logs** - System activity logs
- **500 Geofence Zones** - Safety zones (restricted, caution, safe)
- **1,000 Risk Assessments** - Population density and risk analysis

**Total: 10,000 records**

## 🚀 Quick Start

### Step 1: Ensure Firebase is Set Up

Make sure you have `serviceAccountKey.json` in the `backend/` directory with valid Firebase credentials.

### Step 2: Run the Seeding Script

```bash
cd backend
npm run seed
```

That's it! The script will:
1. Generate 10,000 realistic mock records
2. Write them to Firestore in batches
3. Show progress updates
4. Display a summary when complete

## 📊 What Data Gets Created

### 1. Tourists Collection (5,000 records)

Each tourist record includes:
- **Personal Info**: Name, nationality, passport, phone, email, age, gender
- **Location**: Real-time GPS coordinates across Meghalaya locations
- **Travel Details**: Check-in/out dates, hotel, room number, travel purpose
- **Emergency Contact**: Name, phone, relation
- **Activity**: Visited places, planned destinations, last seen timestamp
- **Status**: Active/inactive, SOS status, risk score
- **Insurance**: Provider and coverage details

**Sample Tourist Record:**
```json
{
  "id": "T000001",
  "name": "Rahul Kumar",
  "nationality": "India",
  "passport": "A1234567",
  "phone": "+91-98765-43210",
  "email": "rahul.kumar@gmail.com",
  "age": 32,
  "gender": "Male",
  "location": {
    "lat": 25.5788,
    "lng": 91.8933,
    "placeName": "Shillong",
    "district": "East Khasi Hills"
  },
  "status": "active",
  "hotel": "Hotel Pine Borough",
  "visitedPlaces": ["Shillong", "Cherrapunji"],
  "sosActive": false,
  "riskScore": 15
}
```

### 2. Alerts Collection (2,000 records)

Alert types include:
- **SOS** - Emergency assistance needed
- **Medical** - Medical emergencies
- **Security** - Security concerns
- **Weather** - Severe weather incidents
- **Accident** - Tourist accidents
- **Lost** - Lost tourists
- **Theft** - Theft reports

**Sample Alert Record:**
```json
{
  "id": "A000001",
  "touristId": "T000123",
  "type": "sos",
  "priority": "critical",
  "status": "pending",
  "location": {
    "lat": 25.5788,
    "lng": 91.8933,
    "address": "Shillong, East Khasi Hills, Meghalaya",
    "district": "East Khasi Hills"
  },
  "message": "Emergency assistance needed immediately",
  "timestamp": "2025-10-18T05:30:00.000Z"
}
```

### 3. Audit Logs Collection (1,500 records)

Tracks system activities:
- User login/logout
- Zone creation/updates/deletion
- Alert acknowledgment/resolution
- Profile updates
- Settings changes
- Report generation

**Sample Audit Log:**
```json
{
  "id": "LOG000001",
  "action": "Alert Acknowledged",
  "userId": "user_25",
  "userEmail": "officer25@safeguard.gov.in",
  "userName": "Priya Singh",
  "ipAddress": "192.168.1.100",
  "timestamp": "2025-10-18T05:30:00.000Z",
  "success": true
}
```

### 4. Zones Collection (500 records)

Geofence zones across Meghalaya:
- **Restricted Zones** (Red) - No-entry areas
- **Caution Zones** (Yellow) - Proceed with caution
- **Safe Zones** (Green) - Safe tourist areas

**Sample Zone Record:**
```json
{
  "id": "Z000001",
  "name": "Restricted Zone 1",
  "type": "restricted",
  "shape": "polygon",
  "center": {
    "lat": 25.5788,
    "lng": 91.8933
  },
  "radius": 2500,
  "district": "East Khasi Hills",
  "color": "#ff0000",
  "active": true,
  "touristsInside": 5
}
```

### 5. Risk Assessments Collection (1,000 records)

Population density and risk analysis:
- Location-based risk scores
- Multiple risk factors (weather, crowd, crime, infrastructure)
- Population density data
- Tourist count
- Active alerts count
- Recommendations

**Sample Risk Assessment:**
```json
{
  "id": "RISK000001",
  "location": {
    "name": "Shillong",
    "district": "East Khasi Hills",
    "lat": 25.5788,
    "lng": 91.8933
  },
  "riskLevel": "medium",
  "riskScore": 65,
  "factors": {
    "weather": 70,
    "crowdDensity": 85,
    "crimeRate": 30,
    "infrastructure": 80,
    "accessibility": 90
  },
  "populationDensity": 450,
  "touristCount": 120,
  "recommendations": [
    "Monitor weather conditions",
    "Increase patrol frequency"
  ]
}
```

## 🎯 Data Distribution

### Geographic Coverage
All data is distributed across **15 major locations** in Meghalaya:
- Shillong (East Khasi Hills)
- Cherrapunji (East Khasi Hills)
- Mawsynram (East Khasi Hills)
- Tura (West Garo Hills)
- Jowai (West Jaintia Hills)
- Nongpoh (Ri-Bhoi)
- Baghmara (South Garo Hills)
- Williamnagar (East Garo Hills)
- Nongstoin (West Khasi Hills)
- Dawki (West Jaintia Hills)
- Umiam (Ri-Bhoi)
- Elephant Falls (East Khasi Hills)
- Police Bazar (East Khasi Hills)
- Laitlum Canyon (East Khasi Hills)
- Living Root Bridge (East Khasi Hills)

### Realistic Patterns
- **75% tourists** are active, 25% inactive
- **2% tourists** have active SOS alerts
- **5% tourists** are in restricted zones
- **95% operations** succeed in audit logs
- **90% zones** are active
- Alert statuses: pending, acknowledged, resolved
- Risk levels: low, medium, high, critical

### Diverse Demographics
- **26 nationalities** represented
- **40 first names** and **40 last names** for variety
- **20 hotels** across Meghalaya
- **7 alert types** covering all emergencies
- **5 travel purposes** (Tourism, Business, Education, Medical, Family)

## ⚙️ Script Features

### Batch Writing
- Writes in batches of 500 documents
- Prevents Firestore rate limiting
- Shows progress updates
- Handles errors gracefully

### Realistic Data Generation
- Random but realistic names and demographics
- Actual Meghalaya locations with GPS coordinates
- Time-based data (check-in dates, timestamps)
- Relational data (alerts linked to tourists)
- Weighted randomness (more active tourists than inactive)

### Performance Optimized
- Efficient batch operations
- Minimal API calls
- Progress tracking
- Automatic cleanup

## 🔍 Verification

After seeding, verify your data:

### 1. Firebase Console
Visit: `https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore`

You should see 5 collections:
- ✅ tourists (5,000 documents)
- ✅ alerts (2,000 documents)
- ✅ auditLogs (1,500 documents)
- ✅ zones (500 documents)
- ✅ riskAssessments (1,000 documents)

### 2. Query Examples

Test queries in Firestore console:

```javascript
// Get active tourists
tourists.where('status', '==', 'active')

// Get critical alerts
alerts.where('priority', '==', 'critical')

// Get restricted zones
zones.where('type', '==', 'restricted')

// Get high-risk assessments
riskAssessments.where('riskLevel', '==', 'high')
```

## 🔄 Re-running the Script

**Warning:** Running the script multiple times will **add more data**, not replace existing data.

### To Clear and Re-seed:
1. Go to Firebase Console
2. Delete all documents from each collection
3. Run `npm run seed` again

### To Add More Data:
Just run `npm run seed` again - it will add another 10,000 records.

## 🛠️ Customization

### Change Data Quantities

Edit `seedDatabase.js`:

```javascript
// Line ~450-460
const tourists = Array.from({ length: 5000 }, (_, i) => generateTourist(i + 1));
const alerts = Array.from({ length: 2000 }, (_, i) => generateAlert(i + 1, ...));
const auditLogs = Array.from({ length: 1500 }, (_, i) => generateAuditLog(i + 1));
const zones = Array.from({ length: 500 }, (_, i) => generateZone(i + 1));
const riskAssessments = Array.from({ length: 1000 }, (_, i) => generateRiskAssessment(i + 1));
```

Change the numbers to your desired quantities.

### Add More Locations

Edit the `meghalayaLocations` array (line ~50):

```javascript
const meghalayaLocations = [
  { name: 'Your Location', lat: 25.xxxx, lng: 91.xxxx, district: 'District Name' },
  // ... add more
];
```

### Add More Names

Edit the `firstNames` and `lastNames` arrays (line ~20-30).

## 📊 Expected Output

When you run `npm run seed`, you'll see:

```
🌱 Starting database seeding...
📊 Project: your-project-id
⏰ Started at: 2025-10-18T05:30:00.000Z

📦 Generating mock data...

   Generating 5,000 tourists...
   Generating 2,000 alerts...
   Generating 1,500 audit logs...
   Generating 500 geofence zones...
   Generating 1,000 risk assessments...

✅ Mock data generation complete!
   Total records: 10000

📤 Writing to Firestore...

📝 Writing 5000 documents to tourists...
   ✅ Written 500/5000 documents
   ✅ Written 1000/5000 documents
   ...
   ✅ Written 5000/5000 documents
✅ Completed tourists: 5000 documents

📝 Writing 2000 documents to alerts...
   ✅ Written 500/2000 documents
   ...
✅ Completed alerts: 2000 documents

[... continues for all collections ...]

============================================================
🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
============================================================

📊 Summary:
   👥 Tourists: 5000
   🚨 Alerts: 2000
   📋 Audit Logs: 1500
   🔒 Geofence Zones: 500
   📊 Risk Assessments: 1000
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📦 TOTAL: 10000 records

⏰ Completed at: 2025-10-18T05:35:00.000Z

✅ Your Firebase database is now populated with realistic mock data!

🔗 View your data at: https://console.firebase.google.com/project/your-project-id/firestore
```

## ⏱️ Execution Time

Expected time: **3-5 minutes** depending on:
- Internet connection speed
- Firestore region
- System performance

## 🐛 Troubleshooting

### Error: "serviceAccountKey.json file not found"
**Solution:** Make sure `serviceAccountKey.json` exists in the `backend/` directory.

### Error: "Invalid service account key"
**Solution:** Download a fresh service account key from Firebase Console.

### Error: "Permission denied"
**Solution:** Ensure your Firebase service account has Firestore write permissions.

### Error: "Quota exceeded"
**Solution:** 
- Wait a few minutes and try again
- Reduce batch size in the script
- Check Firebase quota limits

### Script hangs or is very slow
**Solution:**
- Check your internet connection
- Reduce batch size from 500 to 250
- Check Firebase Console for any issues

## 🔐 Security Notes

- ✅ `serviceAccountKey.json` is in `.gitignore`
- ✅ Never commit Firebase credentials to Git
- ✅ Service account has admin privileges - keep it secure
- ✅ Generated data is mock/fake - safe for testing

## 📚 Next Steps

After seeding:

1. **Update Frontend** to fetch from Firestore instead of mock data
2. **Test Queries** to ensure data is accessible
3. **Implement Pagination** for large datasets
4. **Add Real-time Listeners** for live updates
5. **Create Indexes** for frequently queried fields

## 🤝 Need Help?

- Check Firebase Console for errors
- Review Firestore security rules
- Verify service account permissions
- Check the script output for specific errors

---

**Ready to seed?** Run `npm run seed` in the backend directory!
