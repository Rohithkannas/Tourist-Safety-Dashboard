# ⚡ Quick Seed Instructions

## 🎯 Goal
Add 10,000 realistic mock data records to your Firebase Firestore database.

## ✅ Prerequisites
- ✅ Firebase project created
- ✅ `serviceAccountKey.json` in `backend/` directory
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install`)

## 🚀 Run the Seeding Script

### Option 1: Using npm script (Recommended)
```bash
cd backend
npm run seed
```

### Option 2: Direct node command
```bash
cd backend
node seedDatabase.js
```

## ⏱️ What to Expect

**Time:** 3-5 minutes

**Output:**
```
🌱 Starting database seeding...
📦 Generating mock data...
   Generating 5,000 tourists...
   Generating 2,000 alerts...
   Generating 1,500 audit logs...
   Generating 500 geofence zones...
   Generating 1,000 risk assessments...

✅ Mock data generation complete!

📤 Writing to Firestore...
   ✅ Written 500/5000 documents
   ✅ Written 1000/5000 documents
   ...

🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!

📊 Summary:
   👥 Tourists: 5000
   🚨 Alerts: 2000
   📋 Audit Logs: 1500
   🔒 Geofence Zones: 500
   📊 Risk Assessments: 1000
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📦 TOTAL: 10000 records
```

## 📊 What Gets Created

| Collection | Records | Description |
|------------|---------|-------------|
| **tourists** | 5,000 | Tourist data with locations across Meghalaya |
| **alerts** | 2,000 | Emergency alerts (SOS, medical, security, etc.) |
| **auditLogs** | 1,500 | System activity logs |
| **zones** | 500 | Geofence zones (restricted, caution, safe) |
| **riskAssessments** | 1,000 | Population density and risk analysis |
| **TOTAL** | **10,000** | **Complete mock dataset** |

## 🔍 Verify the Data

### Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Navigate to **Firestore Database**
4. You should see 5 collections with the data

### Quick Test Queries
```javascript
// In Firestore console
tourists.where('status', '==', 'active').limit(10)
alerts.where('priority', '==', 'critical').limit(10)
zones.where('type', '==', 'restricted').limit(10)
```

## 🎨 Data Highlights

### Realistic Features
- ✅ **Real Meghalaya locations** (Shillong, Cherrapunji, Tura, etc.)
- ✅ **26 nationalities** (India, USA, UK, China, Japan, etc.)
- ✅ **Diverse demographics** (40 first names, 40 last names)
- ✅ **Realistic patterns** (75% active tourists, 2% SOS alerts)
- ✅ **Time-based data** (check-in dates, timestamps, etc.)
- ✅ **Relational data** (alerts linked to tourists)

### Geographic Coverage
All 11 districts of Meghalaya covered:
- East Khasi Hills, West Khasi Hills, South West Khasi Hills
- East Garo Hills, West Garo Hills, South Garo Hills, North Garo Hills, South West Garo Hills
- East Jaintia Hills, West Jaintia Hills
- Ri-Bhoi

## 🔄 Need to Re-seed?

**Warning:** Running again will ADD more data, not replace it.

### To start fresh:
1. Delete all documents in Firebase Console
2. Run `npm run seed` again

## 🐛 Common Issues

### "serviceAccountKey.json not found"
**Fix:** Place your Firebase service account key in `backend/` directory

### "Permission denied"
**Fix:** Ensure service account has Firestore write permissions

### Script is slow
**Fix:** Normal! It's writing 10,000 records. Wait 3-5 minutes.

## 📚 Full Documentation

For detailed information, see: [SEEDING_GUIDE.md](SEEDING_GUIDE.md)

---

**That's it!** Your database will be populated with 10,000 professional-looking mock records. 🎉
