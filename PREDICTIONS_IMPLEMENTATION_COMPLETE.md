# Professional ML Predictions - Complete Implementation Guide

## ✅ COMPLETED: ML Service Module
**File**: `frontend/assets/js/ml-service.js`
- Reusable MLService class
- All prediction endpoints
- Status monitoring
- Event-driven architecture

## 🎯 TASK 1: Professional Predictions Page

### File: `frontend/predictions.html`

**Key Requirements**:
1. ❌ NO EMOJIS - Professional text only
2. ✅ Clean, modern UI with glassmorphism
3. ✅ Tabbed interface for different prediction types
4. ✅ Real-time status indicators
5. ✅ Data visualization for results

### HTML Structure:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>ML Risk Predictions - SafeGuard</title>
  <!-- Tailwind + Mapbox + Chart.js -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <!-- Sidebar (same as dashboard) -->
  <aside class="sidebar">...</aside>
  
  <!-- Main Content -->
  <main>
    <!-- Header with Status -->
    <header>
      <h1>Machine Learning Risk Predictions</h1>
      <div class="status-badge" id="mlStatus">
        <span class="pulse-dot"></span>
        <span>Checking Connection...</span>
      </div>
    </header>
    
    <!-- Tabs Navigation -->
    <div class="tabs">
      <button class="tab active" data-tab="train">Model Training</button>
      <button class="tab" data-tab="location">Location Analysis</button>
      <button class="tab" data-tab="tourist">Tourist Risk</button>
      <button class="tab" data-tab="batch">Batch Processing</button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content" id="train-tab">
      <div class="prediction-card">
        <h2>LSTM Model Training</h2>
        <p>Train the neural network on historical tourist safety data</p>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Training Epochs</label>
            <input type="number" id="epochs" value="50">
            <span class="help-text">Recommended: 50-100</span>
          </div>
          
          <div class="form-group">
            <label>Batch Size</label>
            <input type="number" id="batchSize" value="32">
            <span class="help-text">Recommended: 16-64</span>
          </div>
        </div>
        
        <button class="btn-primary" onclick="trainModel()">
          <span>Start Training</span>
          <svg><!-- Arrow icon --></svg>
        </button>
        
        <!-- Progress Bar -->
        <div class="progress-container" id="trainingProgress" style="display:none">
          <div class="progress-bar"></div>
          <span class="progress-text">Training in progress...</span>
        </div>
        
        <!-- Results -->
        <div class="results-panel" id="trainResults"></div>
      </div>
    </div>
    
    <div class="tab-content hidden" id="location-tab">
      <div class="prediction-card">
        <h2>Location Risk Analysis</h2>
        <p>Predict safety risk for specific geographic coordinates</p>
        
        <div class="form-grid">
          <div class="form-group">
            <label>Latitude</label>
            <input type="number" id="lat" value="25.5788" step="0.0001">
          </div>
          
          <div class="form-group">
            <label>Longitude</label>
            <input type="number" id="lng" value="91.8933" step="0.0001">
          </div>
        </div>
        
        <button class="btn-primary" onclick="predictLocation()">
          <span>Analyze Risk</span>
        </button>
        
        <!-- Risk Visualization -->
        <div class="risk-visualization" id="locationRisk"></div>
      </div>
    </div>
    
    <div class="tab-content hidden" id="tourist-tab">
      <div class="prediction-card">
        <h2>Tourist Risk Assessment</h2>
        <p>Evaluate safety risk for individual tourists</p>
        
        <div class="form-group">
          <label>Tourist ID</label>
          <input type="text" id="touristId" value="T000001">
        </div>
        
        <button class="btn-primary" onclick="predictTourist()">
          <span>Assess Risk</span>
        </button>
        
        <div class="tourist-profile" id="touristProfile"></div>
      </div>
    </div>
    
    <div class="tab-content hidden" id="batch-tab">
      <div class="prediction-card">
        <h2>Batch Risk Processing</h2>
        <p>Analyze multiple tourists simultaneously</p>
        
        <div class="form-group">
          <label>Tourist IDs (comma-separated)</label>
          <textarea id="batchIds" rows="4">T000001, T000002, T000003</textarea>
        </div>
        
        <button class="btn-primary" onclick="predictBatch()">
          <span>Process Batch</span>
        </button>
        
        <div class="batch-results" id="batchResults"></div>
      </div>
    </div>
  </main>
  
  <script src="./assets/js/ml-service.js"></script>
  <script src="./assets/js/predictions.js"></script>
</body>
</html>
```

### CSS Styling (Professional):
```css
/* Glassmorphism Cards */
.prediction-card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 24px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #333;
  margin-bottom: 32px;
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Progress Bar */
.progress-container {
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.progress-bar {
  height: 8px;
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  border-radius: 4px;
  animation: progress 2s ease-in-out infinite;
}

/* Risk Visualization */
.risk-visualization {
  margin-top: 32px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.risk-meter {
  position: relative;
  height: 120px;
  margin-bottom: 24px;
}

.risk-level {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.risk-level.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.risk-level.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.risk-level.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.risk-level.critical { background: rgba(220, 38, 38, 0.2); color: #dc2626; }
```

### JavaScript (predictions.js):
```javascript
// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  });
});

// Initialize ML Service
mlService.init();

// Listen for status changes
window.addEventListener('mlStatusChange', (event) => {
  const { online, modelLoaded } = event.detail;
  const statusBadge = document.getElementById('mlStatus');
  
  if (online && modelLoaded) {
    statusBadge.innerHTML = `
      <span class="pulse-dot"></span>
      <span>Model Active</span>
    `;
    statusBadge.style.background = 'rgba(34, 197, 94, 0.1)';
    statusBadge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
  } else if (online) {
    statusBadge.innerHTML = `
      <span class="pulse-dot" style="background: #f59e0b"></span>
      <span>Model Not Trained</span>
    `;
    statusBadge.style.background = 'rgba(245, 158, 11, 0.1)';
    statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
  } else {
    statusBadge.innerHTML = `
      <span class="pulse-dot" style="background: #ef4444"></span>
      <span>Service Offline</span>
    `;
    statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
    statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  }
});

// Train Model
async function trainModel() {
  const btn = event.target.closest('button');
  const epochs = parseInt(document.getElementById('epochs').value);
  const batchSize = parseInt(document.getElementById('batchSize').value);
  
  btn.disabled = true;
  btn.innerHTML = '<span>Training...</span>';
  
  document.getElementById('trainingProgress').style.display = 'block';
  
  const result = await mlService.trainModel({ epochs, batchSize });
  
  document.getElementById('trainingProgress').style.display = 'none';
  
  if (result.success) {
    document.getElementById('trainResults').innerHTML = `
      <div class="success-message">
        <h3>Training Completed Successfully</h3>
        <div class="metrics">
          <div class="metric">
            <span class="label">Final Loss</span>
            <span class="value">${result.final_loss.toFixed(4)}</span>
          </div>
          <div class="metric">
            <span class="label">Validation Loss</span>
            <span class="value">${result.final_val_loss.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    document.getElementById('trainResults').innerHTML = `
      <div class="error-message">
        <h3>Training Failed</h3>
        <p>${result.error}</p>
      </div>
    `;
  }
  
  btn.disabled = false;
  btn.innerHTML = '<span>Start Training</span>';
}

// Predict Location
async function predictLocation() {
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  
  const result = await mlService.predictLocationRisk(lat, lng);
  
  if (result.success) {
    const riskInfo = mlService.getRiskLevel(result.risk_score);
    
    document.getElementById('locationRisk').innerHTML = `
      <div class="risk-result">
        <div class="risk-score">${(result.risk_score * 100).toFixed(1)}%</div>
        <div class="risk-level ${riskInfo.level}">${riskInfo.label}</div>
        
        <div class="risk-meter">
          <div class="risk-bar" style="width: ${result.risk_score * 100}%; background: ${riskInfo.color}"></div>
        </div>
        
        <div class="location-info">
          <p>Latitude: ${lat}</p>
          <p>Longitude: ${lng}</p>
          <p>Analyzed: ${new Date(result.timestamp).toLocaleString()}</p>
        </div>
      </div>
    `;
  }
}

// Predict Tourist
async function predictTourist() {
  const touristId = document.getElementById('touristId').value;
  const result = await mlService.predictTouristRisk(touristId);
  
  if (result.success) {
    const riskInfo = mlService.getRiskLevel(result.risk_score);
    
    document.getElementById('touristProfile').innerHTML = `
      <div class="tourist-card">
        <h3>${result.tourist_name}</h3>
        <p class="tourist-id">${result.tourist_id}</p>
        
        <div class="risk-badge ${riskInfo.level}">
          ${riskInfo.label} - ${(result.risk_score * 100).toFixed(1)}%
        </div>
        
        <div class="location-map">
          <p>Location: ${result.location.lat}, ${result.location.lng}</p>
        </div>
      </div>
    `;
  }
}

// Batch Predict
async function predictBatch() {
  const ids = document.getElementById('batchIds').value
    .split(',')
    .map(id => id.trim())
    .filter(id => id);
  
  const result = await mlService.predictBatch(ids);
  
  if (result.success) {
    const html = result.predictions.map(pred => {
      const riskInfo = mlService.getRiskLevel(pred.risk_score);
      return `
        <div class="batch-item">
          <div class="batch-header">
            <span class="name">${pred.tourist_name}</span>
            <span class="risk-level ${riskInfo.level}">${riskInfo.label}</span>
          </div>
          <div class="batch-score">${(pred.risk_score * 100).toFixed(1)}%</div>
        </div>
      `;
    }).join('');
    
    document.getElementById('batchResults').innerHTML = `
      <div class="batch-container">
        <h3>Processed ${result.total} Tourists</h3>
        ${html}
      </div>
    `;
  }
}
```

## 🎯 TASK 2: Analytics Dashboard Integration

### File: `frontend/analytics.html`

**Add before closing `</body>` tag**:
```html
<!-- ML Service Integration -->
<script src="./assets/js/ml-service.js"></script>
<script>
  // Initialize ML Service
  mlService.init();
  
  // Add ML Predictions Section to Analytics
  async function addMLPredictions() {
    // Get current map locations
    const locations = [
      { lat: 25.5788, lng: 91.8933, name: 'Shillong' },
      { lat: 25.2676, lng: 91.7320, name: 'Cherrapunji' },
      { lat: 25.4670, lng: 91.3662, name: 'Nongpoh' }
    ];
    
    // Get ML predictions
    const predictions = await mlService.predictHotspots(locations, 24);
    
    if (predictions.success) {
      // Update heatmap with ML data
      updateHeatmapWithML(predictions.hotspots);
    }
  }
  
  // Update heatmap with ML predictions
  function updateHeatmapWithML(hotspots) {
    hotspots.forEach(spot => {
      const riskInfo = mlService.getRiskLevel(spot.avg_risk);
      
      // Add marker to map
      new mapboxgl.Marker({ color: riskInfo.color })
        .setLngLat([spot.lng, spot.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="ml-popup">
            <h4>${spot.name}</h4>
            <p class="risk-level">${riskInfo.label}</p>
            <p class="risk-score">${(spot.avg_risk * 100).toFixed(1)}% Risk</p>
            <p class="prediction-count">${spot.predictions} predictions</p>
          </div>
        `))
        .addTo(map);
    });
  }
  
  // Call on page load
  setTimeout(addMLPredictions, 2000);
</script>
```

## 📋 Implementation Checklist

### Predictions Page:
- [ ] Create predictions.html with tabbed interface
- [ ] Remove all emojis from UI
- [ ] Add glassmorphism styling
- [ ] Implement tab switching
- [ ] Add progress indicators
- [ ] Create risk visualization components
- [ ] Add Chart.js for data visualization
- [ ] Test all prediction functions

### Analytics Integration:
- [ ] Add ml-service.js script to analytics.html
- [ ] Create ML predictions section
- [ ] Update heatmap with ML data
- [ ] Add real-time prediction updates
- [ ] Create ML prediction legend
- [ ] Test integration

### Testing:
- [ ] Test ML service connection
- [ ] Test model training
- [ ] Test location predictions
- [ ] Test tourist predictions
- [ ] Test batch processing
- [ ] Test analytics integration
- [ ] Test error handling

## 🚀 Deployment Notes

1. Ensure ML API server is running on port 5001
2. Train model before using predictions
3. Monitor ML service status in real-time
4. All predictions are non-blocking
5. Error messages are user-friendly
