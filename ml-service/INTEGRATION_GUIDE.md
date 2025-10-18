# LSTM ML Service - Frontend Integration Guide

## 🎯 Quick Start Integration

### Step 1: Start the ML Service

```bash
# Terminal 1 - Train the model (first time only)
cd ml-service
pip install -r requirements.txt
python train_model.py

# Terminal 2 - Start ML API server
python api_server.py
```

### Step 2: Add ML API Script to Dashboard

Add this to your `dashboard.html` before the closing `</body>` tag:

```html
<!-- ML Prediction API -->
<script src="./assets/js/ml-api.js"></script>
```

### Step 3: Use ML Predictions in Your Code

## 📊 Dashboard Integration Examples

### Example 1: Show Risk on Tourist Search

Update your `searchAndLocateTourist()` function in `dashboard.html`:

```javascript
async function searchAndLocateTourist() {
  const searchInput = document.getElementById('searchInput');
  const searchValue = searchInput.value.trim().toUpperCase();
  
  if (!searchValue) {
    showNotification('Please enter a Tourist ID', 'error');
    return;
  }
  
  try {
    showNotification('Searching for tourist...', 'info');
    
    // Fetch tourist from Firestore
    const tourist = await FirestoreAPI.fetchTouristById(searchValue);
    
    // Get ML risk prediction
    const prediction = await MLAPI.predictTouristRisk(searchValue);
    
    if (tourist && tourist.location) {
      // Locate tourist on map with risk indicator
      locateTouristOnMapWithRisk(tourist, prediction);
      
      // Show notification with risk level
      const riskEmoji = MLAPI.getRiskEmoji(prediction.riskLevel);
      showNotification(
        `${riskEmoji} Found ${tourist.name} - Risk: ${prediction.riskLevel}`, 
        'success'
      );
      
      searchInput.value = '';
    } else {
      showNotification(`Tourist ${searchValue} not found`, 'error');
    }
  } catch (error) {
    console.error('Error searching tourist:', error);
    showNotification(`Tourist ${searchValue} not found in database`, 'error');
  }
}

// Enhanced function with risk visualization
function locateTouristOnMapWithRisk(tourist, prediction) {
  if (!window.dashboardMap || !tourist.location) return;
  
  const { lat, lng } = tourist.location;
  
  // Get risk color
  const riskColor = MLAPI.getRiskColor(prediction.riskLevel);
  
  // Create custom marker with risk indicator
  const el = document.createElement('div');
  el.className = 'custom-marker';
  el.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: ${riskColor};
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 20px ${riskColor};
    animation: pulse 2s infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  `;
  el.innerHTML = '👤';
  
  // Create popup with risk information
  const popupContent = MLAPI.createRiskPopupContent(tourist, prediction);
  
  const marker = new mapboxgl.Marker(el)
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
    .addTo(window.dashboardMap);
  
  // Fly to location
  window.dashboardMap.flyTo({
    center: [lng, lat],
    zoom: 14,
    duration: 2000
  });
  
  // Auto-open popup
  setTimeout(() => marker.togglePopup(), 500);
}
```

### Example 2: Display Risk Hotspots on Map

Add this function to show predicted high-risk areas:

```javascript
async function displayRiskHotspots() {
  try {
    // Define locations to check
    const locations = [
      { lat: 25.5788, lng: 91.8933, name: 'Shillong' },
      { lat: 25.2676, lng: 91.7320, name: 'Cherrapunji' },
      { lat: 25.2958, lng: 91.5831, name: 'Mawsynram' },
      { lat: 25.5138, lng: 90.2036, name: 'Tura' },
      { lat: 25.4522, lng: 92.1950, name: 'Jowai' }
    ];
    
    // Get predictions for next 24 hours
    const result = await MLAPI.predictHotspots(locations, 24);
    
    if (result.success) {
      // Display hotspots on map
      result.hotspots.forEach(hotspot => {
        const { location, avg_risk } = hotspot;
        const riskLevel = avg_risk < 0.3 ? 'low' :
                         avg_risk < 0.6 ? 'medium' :
                         avg_risk < 0.8 ? 'high' : 'critical';
        
        const color = MLAPI.getRiskColor(riskLevel);
        const emoji = MLAPI.getRiskEmoji(riskLevel);
        
        // Add circle to represent risk area
        window.dashboardMap.addLayer({
          id: `hotspot-${location.name}`,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [location.lng, location.lat]
              }
            }
          },
          paint: {
            'circle-radius': 30,
            'circle-color': color,
            'circle-opacity': 0.3,
            'circle-stroke-width': 2,
            'circle-stroke-color': color
          }
        });
        
        // Add marker
        const el = document.createElement('div');
        el.innerHTML = emoji;
        el.style.fontSize = '24px';
        
        new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-3">
              <h3 class="font-bold">${location.name}</h3>
              <p class="text-sm">Risk Level: <strong>${riskLevel}</strong></p>
              <p class="text-sm">Avg Risk: ${MLAPI.formatRiskScore(avg_risk)}</p>
              <p class="text-xs text-gray-500 mt-2">Next 24 hours prediction</p>
            </div>
          `))
          .addTo(window.dashboardMap);
      });
      
      showNotification('Risk hotspots updated', 'success');
    }
  } catch (error) {
    console.error('Error displaying hotspots:', error);
  }
}

// Call this on page load or periodically
displayRiskHotspots();
setInterval(displayRiskHotspots, 3600000); // Update every hour
```

### Example 3: Batch Risk Assessment for All Tourists

```javascript
async function assessAllTouristsRisk() {
  try {
    // Fetch all tourists
    const tourists = await FirestoreAPI.fetchTourists();
    
    // Get first 50 tourist IDs for batch prediction
    const touristIds = tourists.slice(0, 50).map(t => t.id);
    
    // Get batch predictions
    const result = await MLAPI.predictBatchRisk(touristIds);
    
    if (result.success) {
      // Group by risk level
      const riskGroups = {
        critical: [],
        high: [],
        medium: [],
        low: []
      };
      
      result.predictions.forEach(pred => {
        riskGroups[pred.risk_level].push(pred);
      });
      
      // Display statistics
      console.log('Risk Assessment Summary:');
      console.log(`🔴 Critical: ${riskGroups.critical.length}`);
      console.log(`🟠 High: ${riskGroups.high.length}`);
      console.log(`🟡 Medium: ${riskGroups.medium.length}`);
      console.log(`🟢 Low: ${riskGroups.low.length}`);
      
      // Update dashboard stats
      updateRiskStatistics(riskGroups);
      
      return riskGroups;
    }
  } catch (error) {
    console.error('Error in batch risk assessment:', error);
  }
}

function updateRiskStatistics(riskGroups) {
  // Update your dashboard statistics panel
  document.getElementById('criticalCount').textContent = riskGroups.critical.length;
  document.getElementById('highCount').textContent = riskGroups.high.length;
  document.getElementById('mediumCount').textContent = riskGroups.medium.length;
  document.getElementById('lowCount').textContent = riskGroups.low.length;
}
```

### Example 4: Real-time Risk Monitoring

Add a risk monitoring panel to your dashboard:

```html
<!-- Add to dashboard.html -->
<div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h3 class="text-xl font-bold text-white mb-4">🧠 AI Risk Monitoring</h3>
  
  <div class="grid grid-cols-4 gap-4 mb-4">
    <div class="text-center">
      <div class="text-3xl font-bold text-red-400" id="criticalCount">0</div>
      <div class="text-xs text-gray-400">Critical</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-orange-400" id="highCount">0</div>
      <div class="text-xs text-gray-400">High</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-yellow-400" id="mediumCount">0</div>
      <div class="text-xs text-gray-400">Medium</div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-green-400" id="lowCount">0</div>
      <div class="text-xs text-gray-400">Low</div>
    </div>
  </div>
  
  <button onclick="assessAllTouristsRisk()" 
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    🔄 Refresh Risk Assessment
  </button>
</div>
```

## 🔧 Advanced Integration

### Auto-refresh Risk Predictions

```javascript
// Initialize ML monitoring on page load
(async function initMLMonitoring() {
  // Check if ML service is available
  const isAvailable = await MLAPI.checkMLHealth();
  
  if (isAvailable) {
    console.log('✅ ML service is available');
    
    // Initial assessment
    await assessAllTouristsRisk();
    
    // Auto-refresh every 5 minutes
    setInterval(assessAllTouristsRisk, 300000);
    
    // Update hotspots every hour
    await displayRiskHotspots();
    setInterval(displayRiskHotspots, 3600000);
  } else {
    console.warn('⚠️ ML service not available - predictions disabled');
  }
})();
```

### Add Risk Indicator to Tourist Cards

```javascript
async function createTouristCard(tourist) {
  // Get risk prediction
  const prediction = await MLAPI.predictTouristRisk(tourist.id);
  
  const riskColor = MLAPI.getRiskColor(prediction.riskLevel);
  const riskEmoji = MLAPI.getRiskEmoji(prediction.riskLevel);
  
  return `
    <div class="tourist-card bg-gray-800 rounded-lg p-4 border-l-4" 
         style="border-color: ${riskColor}">
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-bold text-white">${tourist.name}</h4>
        <span class="text-2xl">${riskEmoji}</span>
      </div>
      
      <div class="text-sm text-gray-400 space-y-1">
        <div>ID: ${tourist.id}</div>
        <div>Location: ${tourist.location?.name || 'Unknown'}</div>
        <div class="flex items-center gap-2">
          <span>AI Risk:</span>
          <span class="font-bold" style="color: ${riskColor}">
            ${prediction.riskLevel.toUpperCase()}
          </span>
          <span class="text-xs">(${MLAPI.formatRiskScore(prediction.riskScore)})</span>
        </div>
      </div>
      
      <button onclick="locateTouristOnMapWithRisk(${JSON.stringify(tourist)}, ${JSON.stringify(prediction)})"
              class="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
        View on Map
      </button>
    </div>
  `;
}
```

## 🎨 UI Components

### Risk Level Badge Component

```javascript
function createRiskBadge(riskLevel) {
  const color = MLAPI.getRiskColor(riskLevel);
  const emoji = MLAPI.getRiskEmoji(riskLevel);
  
  return `
    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
          style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}">
      <span>${emoji}</span>
      <span>${riskLevel.toUpperCase()}</span>
    </span>
  `;
}
```

### Risk Progress Bar

```javascript
function createRiskProgressBar(riskScore) {
  const color = MLAPI.getRiskColor(
    riskScore < 0.3 ? 'low' :
    riskScore < 0.6 ? 'medium' :
    riskScore < 0.8 ? 'high' : 'critical'
  );
  
  return `
    <div class="w-full bg-gray-700 rounded-full h-2">
      <div class="h-2 rounded-full transition-all duration-500"
           style="width: ${riskScore * 100}%; background-color: ${color}">
      </div>
    </div>
    <div class="text-xs text-gray-400 mt-1">
      Risk Score: ${MLAPI.formatRiskScore(riskScore)}
    </div>
  `;
}
```

## 🔔 Alert Integration

### Send Alert for High-Risk Tourists

```javascript
async function monitorHighRiskTourists() {
  const tourists = await FirestoreAPI.fetchTourists();
  const touristIds = tourists.map(t => t.id);
  
  const result = await MLAPI.predictBatchRisk(touristIds);
  
  if (result.success) {
    // Filter high and critical risk
    const highRisk = result.predictions.filter(
      p => p.risk_level === 'high' || p.risk_level === 'critical'
    );
    
    if (highRisk.length > 0) {
      // Create alerts
      for (const tourist of highRisk) {
        await createRiskAlert(tourist);
      }
      
      showNotification(
        `⚠️ ${highRisk.length} tourists in high-risk areas`,
        'warning'
      );
    }
  }
}

async function createRiskAlert(tourist) {
  // Create alert in Firebase
  await FirestoreAPI.createAlert({
    type: 'ai_prediction',
    priority: tourist.risk_level === 'critical' ? 'critical' : 'high',
    touristId: tourist.tourist_id,
    touristName: tourist.tourist_name,
    location: tourist.location,
    message: `AI detected ${tourist.risk_level} risk for ${tourist.tourist_name}`,
    riskScore: tourist.risk_score,
    timestamp: new Date().toISOString()
  });
}
```

## 📱 Mobile Responsive

All ML API components are mobile-friendly. The risk indicators and predictions work seamlessly on all device sizes.

## 🐛 Error Handling

```javascript
async function safePredictRisk(touristId) {
  try {
    const prediction = await MLAPI.predictTouristRisk(touristId);
    
    if (prediction.success) {
      return prediction;
    } else {
      console.warn(`Prediction failed for ${touristId}:`, prediction.error);
      // Return default low risk
      return {
        success: false,
        riskLevel: 'low',
        riskScore: 0.1,
        error: prediction.error
      };
    }
  } catch (error) {
    console.error('ML API error:', error);
    // Fallback to low risk
    return {
      success: false,
      riskLevel: 'low',
      riskScore: 0.1,
      error: error.message
    };
  }
}
```

## 🚀 Performance Tips

1. **Cache Predictions**: Store predictions for 5-10 minutes to reduce API calls
2. **Batch Requests**: Use batch prediction for multiple tourists
3. **Lazy Loading**: Only predict risk when tourist card is visible
4. **Background Updates**: Refresh predictions in the background

## 📊 Analytics Integration

Track ML prediction usage:

```javascript
function trackMLPrediction(touristId, riskLevel) {
  // Log to analytics
  console.log(`ML Prediction: ${touristId} - ${riskLevel}`);
  
  // Could integrate with Google Analytics, Mixpanel, etc.
  if (window.gtag) {
    gtag('event', 'ml_prediction', {
      tourist_id: touristId,
      risk_level: riskLevel
    });
  }
}
```

---

**Ready to use! Start the ML service and integrate these examples into your dashboard.** 🚀
