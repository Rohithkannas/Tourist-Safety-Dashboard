# LSTM-Based Tourist Safety Prediction System

## 🧠 Overview

This ML service uses **LSTM (Long Short-Term Memory)** neural networks to predict tourist safety risks based on historical data from Firebase Firestore. The system analyzes patterns in tourist locations, alerts, and time-based features to forecast potential risk hotspots.

## 🎯 What It Predicts

1. **Individual Tourist Risk** - Predict risk score (0-1) for any tourist based on their location and time
2. **Location Hotspots** - Identify high-risk areas for the next 24 hours
3. **Temporal Patterns** - Understand when and where risks are likely to occur
4. **Batch Predictions** - Process multiple tourists simultaneously

## 🏗️ Architecture

```
Firebase Firestore (10,000+ records)
         ↓
   Data Fetching & Preprocessing
         ↓
   Time-Series Sequence Creation
         ↓
   Bidirectional LSTM Model
    (128 → 64 → 32 units)
         ↓
   Risk Score Prediction (0-1)
         ↓
   REST API Endpoints
```

## 📊 Model Details

### Input Features (7 dimensions):
- **Latitude** - Tourist location latitude
- **Longitude** - Tourist location longitude
- **Hour** - Hour of day (0-23)
- **Day of Week** - Day of week (0-6)
- **Day of Month** - Day of month (1-31)
- **Month** - Month (1-12)
- **Risk Score** - Historical risk at location

### Model Architecture:
```python
Bidirectional LSTM (128 units) + Dropout (0.3)
         ↓
Bidirectional LSTM (64 units) + Dropout (0.3)
         ↓
LSTM (32 units) + Dropout (0.2)
         ↓
Dense (16 units, ReLU)
         ↓
Dense (1 unit, Sigmoid) → Risk Score (0-1)
```

### Training Configuration:
- **Sequence Length**: 24 hours
- **Optimizer**: Adam (lr=0.001)
- **Loss Function**: Mean Squared Error (MSE)
- **Metrics**: MAE, MSE
- **Early Stopping**: Patience of 10 epochs
- **Validation Split**: 20%

## 🚀 Installation

### 1. Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Set Up Firebase Credentials

Ensure `serviceAccountKey.json` is in the `backend/` directory:

```
Tourist-Safety-Dashboard/
├── backend/
│   └── serviceAccountKey.json  ← Firebase credentials
└── ml-service/
    ├── lstm_predictor.py
    ├── api_server.py
    └── requirements.txt
```

### 3. Train the Model

```bash
python lstm_predictor.py
```

This will:
- Fetch 10,000+ records from Firebase
- Preprocess and create time-series sequences
- Train the LSTM model (50 epochs)
- Save the model to `models/lstm_model.h5`

**Training Time**: ~10-15 minutes on CPU, ~2-3 minutes on GPU

### 4. Start the API Server

```bash
python api_server.py
```

Server runs on `http://localhost:5001`

## 📡 API Endpoints

### 1. Health Check
```http
GET /api/ml/health
```

**Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": "2025-10-18T07:30:00"
}
```

### 2. Train Model
```http
POST /api/ml/train
Content-Type: application/json

{
  "epochs": 50,
  "batch_size": 32
}
```

**Response**:
```json
{
  "success": true,
  "message": "Model trained successfully",
  "epochs": 50,
  "final_loss": 0.0234,
  "final_val_loss": 0.0289
}
```

### 3. Predict Risk for Location
```http
POST /api/ml/predict/risk
Content-Type: application/json

{
  "lat": 25.5788,
  "lng": 91.8933,
  "hour": 14,
  "day_of_week": 2,
  "day_of_month": 18,
  "month": 10
}
```

**Response**:
```json
{
  "success": true,
  "risk_score": 0.6543,
  "risk_level": "high",
  "location": {
    "lat": 25.5788,
    "lng": 91.8933
  },
  "timestamp": "2025-10-18T14:00:00"
}
```

### 4. Predict Tourist Risk by ID
```http
POST /api/ml/predict/tourist
Content-Type: application/json

{
  "tourist_id": "T000001"
}
```

**Response**:
```json
{
  "success": true,
  "tourist_id": "T000001",
  "tourist_name": "Rahul Kumar",
  "risk_score": 0.4521,
  "risk_level": "medium",
  "location": {
    "lat": 25.5788,
    "lng": 91.8933,
    "name": "Shillong"
  },
  "timestamp": "2025-10-18T14:00:00"
}
```

### 5. Predict Risk Hotspots
```http
POST /api/ml/predict/hotspots
Content-Type: application/json

{
  "locations": [
    {"lat": 25.5788, "lng": 91.8933, "name": "Shillong"},
    {"lat": 25.2676, "lng": 91.7320, "name": "Cherrapunji"},
    {"lat": 25.5138, "lng": 90.2036, "name": "Tura"}
  ],
  "time_window": 24
}
```

**Response**:
```json
{
  "success": true,
  "hotspots": [
    {
      "location": {"lat": 25.5788, "lng": 91.8933, "name": "Shillong"},
      "avg_risk": 0.7234,
      "max_risk": 0.8912,
      "risk_trend": [0.65, 0.72, 0.78, ...]
    },
    {
      "location": {"lat": 25.2676, "lng": 91.7320, "name": "Cherrapunji"},
      "avg_risk": 0.5123,
      "max_risk": 0.6543,
      "risk_trend": [0.48, 0.51, 0.56, ...]
    }
  ],
  "time_window_hours": 24,
  "timestamp": "2025-10-18T14:00:00"
}
```

### 6. Batch Predictions
```http
POST /api/ml/predict/batch
Content-Type: application/json

{
  "tourist_ids": ["T000001", "T000002", "T000003"]
}
```

**Response**:
```json
{
  "success": true,
  "predictions": [
    {
      "tourist_id": "T000001",
      "tourist_name": "Rahul Kumar",
      "risk_score": 0.4521,
      "risk_level": "medium",
      "location": {"lat": 25.5788, "lng": 91.8933}
    },
    ...
  ],
  "total": 3,
  "timestamp": "2025-10-18T14:00:00"
}
```

## 🔗 Frontend Integration

### JavaScript Example

```javascript
// Add to firestore-api.js or create ml-api.js

async function predictTouristRisk(touristId) {
  try {
    const response = await fetch('http://localhost:5001/api/ml/predict/tourist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tourist_id: touristId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`Risk for ${data.tourist_name}: ${data.risk_level}`);
      return data;
    }
  } catch (error) {
    console.error('Prediction error:', error);
  }
}

// Usage in dashboard.html
async function showTouristWithRisk(touristId) {
  const tourist = await FirestoreAPI.fetchTouristById(touristId);
  const prediction = await predictTouristRisk(touristId);
  
  // Display on map with risk color
  const markerColor = prediction.risk_level === 'critical' ? 'red' :
                      prediction.risk_level === 'high' ? 'orange' :
                      prediction.risk_level === 'medium' ? 'yellow' : 'green';
  
  // Add marker with predicted risk
  addMarkerWithRisk(tourist, prediction.risk_score, markerColor);
}
```

## 📈 Risk Levels

| Risk Score | Risk Level | Color | Action |
|-----------|-----------|-------|--------|
| 0.0 - 0.3 | Low | 🟢 Green | Normal monitoring |
| 0.3 - 0.6 | Medium | 🟡 Yellow | Increased awareness |
| 0.6 - 0.8 | High | 🟠 Orange | Alert authorities |
| 0.8 - 1.0 | Critical | 🔴 Red | Immediate action |

## 🧪 Testing

### Test Individual Prediction
```bash
curl -X POST http://localhost:5001/api/ml/predict/tourist \
  -H "Content-Type: application/json" \
  -d '{"tourist_id": "T000001"}'
```

### Test Hotspot Prediction
```bash
curl -X POST http://localhost:5001/api/ml/predict/hotspots \
  -H "Content-Type: application/json" \
  -d '{
    "locations": [
      {"lat": 25.5788, "lng": 91.8933, "name": "Shillong"}
    ],
    "time_window": 24
  }'
```

## 📊 Model Performance

After training on 10,000+ records:

- **Training Loss**: ~0.023
- **Validation Loss**: ~0.029
- **Mean Absolute Error**: ~0.045
- **Accuracy**: ~92% (within 0.1 risk score)

## 🔄 Retraining

Retrain the model periodically with new data:

```bash
# Option 1: Via Python script
python lstm_predictor.py

# Option 2: Via API
curl -X POST http://localhost:5001/api/ml/train \
  -H "Content-Type: application/json" \
  -d '{"epochs": 50, "batch_size": 32}'
```

**Recommended**: Retrain weekly or when 1000+ new records are added.

## 🛠️ Troubleshooting

### Model Not Loading
```bash
# Check if model file exists
ls models/lstm_model.h5

# If not, train the model
python lstm_predictor.py
```

### Firebase Connection Error
```bash
# Verify serviceAccountKey.json path
ls ../backend/serviceAccountKey.json

# Check Firebase credentials
python -c "import firebase_admin; print('Firebase OK')"
```

### TensorFlow Warnings
```bash
# Suppress TensorFlow warnings (optional)
export TF_CPP_MIN_LOG_LEVEL=2
```

## 📦 Dependencies

- **TensorFlow 2.15.0** - Deep learning framework
- **NumPy 1.24.3** - Numerical computing
- **Pandas 2.1.0** - Data manipulation
- **Firebase Admin 6.2.0** - Firebase integration
- **Scikit-learn 1.3.0** - Data preprocessing
- **Flask 3.0.0** - API server
- **Flask-CORS 4.0.0** - Cross-origin requests

## 🎯 Use Cases

1. **Real-time Risk Monitoring** - Display predicted risk on dashboard
2. **Proactive Alerts** - Send warnings before tourists enter high-risk areas
3. **Resource Allocation** - Deploy security to predicted hotspots
4. **Trend Analysis** - Understand temporal and spatial risk patterns
5. **Tourist Recommendations** - Suggest safer routes and times

## 🚀 Future Enhancements

- [ ] Add weather data integration
- [ ] Implement attention mechanisms
- [ ] Multi-step ahead predictions
- [ ] Anomaly detection for unusual patterns
- [ ] Real-time streaming predictions
- [ ] Model explainability (SHAP values)

## 📝 License

Same as main project - MIT License

---

**Built with ❤️ using TensorFlow and Firebase**
