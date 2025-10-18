# ML API Server - Quick Start Guide

## 🚀 Start the ML API Server

### Step 1: Navigate to ml-service directory
```bash
cd ml-service
```

### Step 2: Install dependencies (if not already installed)
```bash
pip install flask flask-cors tensorflow numpy pandas firebase-admin
```

### Step 3: Start the API server
```bash
python api_server.py
```

You should see:
```
🚀 Starting LSTM Prediction API Server...
✅ Loaded existing LSTM model
 * Running on http://0.0.0.0:5001
```

## ✅ Verify Server is Running

Open your browser and go to:
```
http://localhost:5001
```

You should see API information in JSON format.

## 🎯 Using the Predictions Page

1. **Start the frontend server** (in a separate terminal):
   ```bash
   cd frontend
   python -m http.server 8000
   ```

2. **Open the predictions page**:
   ```
   http://127.0.0.1:8000/predictions.html
   ```

3. **Check status**: The header should show "Model Active" (green) or "Model Not Trained" (yellow)

4. **Train the model** (if needed):
   - Set epochs (e.g., 50)
   - Set batch size (e.g., 32)
   - Click "Start Training"
   - Wait 5-10 minutes for training to complete

5. **Make predictions**:
   - **Location Risk**: Enter latitude/longitude and click "Analyze Risk"
   - **Tourist Risk**: Enter tourist ID and click "Assess Risk"

## 🔧 Troubleshooting

### Error: "Service Offline"
**Solution**: Start the ML API server
```bash
cd ml-service
python api_server.py
```

### Error: "Model Not Trained"
**Solution**: Train the model using the "Train LSTM Model" section on the predictions page

### Error: "Timeout of 300.0s exceeded"
**Solutions**:
1. **Reduce epochs**: Try 20-30 instead of 50
2. **Reduce batch size**: Try 16 instead of 32
3. **Check Firebase data**: Ensure you have training data in Firebase
4. **Wait longer**: Training can take 5-10 minutes depending on data size

### Error: "429 Quota exceeded"
**Solutions**:
1. **Restart the API server**: Stop (Ctrl+C) and restart
2. **Check port 5001**: Ensure no other service is using port 5001
3. **Wait a moment**: The server may be processing a previous request

### Error: "Port 5001 already in use"
**Solution**: Kill the existing process
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5001 | xargs kill -9
```

## 📊 Expected Response Times

- **Health Check**: < 1 second
- **Location Prediction**: 1-3 seconds
- **Tourist Prediction**: 1-3 seconds
- **Model Training**: 5-10 minutes (depends on data size and epochs)

## 🎨 UI Features

### Success Response (Green):
- Shows risk score percentage
- Displays risk level (Low/Medium/High/Critical)
- Includes location/tourist details
- Timestamp of prediction

### Error Response (Red):
- Clear error message
- Troubleshooting steps
- Command examples to fix the issue

### Loading State (Yellow):
- Spinning loader icon
- Progress message
- Estimated time for long operations

## 💡 Tips

1. **Train once, predict many**: You only need to train the model once. After training, you can make unlimited predictions.

2. **Save the model**: The trained model is automatically saved to `ml-service/models/lstm_model.h5`

3. **Reuse the model**: If you restart the server, it will automatically load the saved model (no need to retrain)

4. **Monitor the console**: The API server console shows detailed logs of all requests

5. **Use realistic coordinates**: For Meghalaya, use coordinates around:
   - Latitude: 25.0° to 26.0°
   - Longitude: 90.0° to 92.0°

## 🔗 API Endpoints

- `GET /` - API information
- `GET /api/ml/health` - Health check
- `POST /api/ml/train` - Train model
- `POST /api/ml/predict/risk` - Predict location risk
- `POST /api/ml/predict/tourist` - Predict tourist risk
- `POST /api/ml/predict/batch` - Batch predictions
- `POST /api/ml/predict/hotspots` - Hotspot predictions

## 📝 Example Requests

### Train Model
```json
POST http://localhost:5001/api/ml/train
{
  "epochs": 50,
  "batch_size": 32
}
```

### Predict Location Risk
```json
POST http://localhost:5001/api/ml/predict/risk
{
  "lat": 25.5788,
  "lng": 91.8933
}
```

### Predict Tourist Risk
```json
POST http://localhost:5001/api/ml/predict/tourist
{
  "tourist_id": "T000001"
}
```

## ✅ Success!

Once you see "Model Active" (green status) in the predictions page header, you're ready to make predictions!
