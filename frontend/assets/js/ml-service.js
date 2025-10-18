/**
 * ML Service Integration Module
 * Provides unified interface for LSTM prediction API
 */

class MLService {
  constructor(baseUrl = 'http://localhost:5001') {
    this.baseUrl = baseUrl;
    this.isOnline = false;
    this.modelLoaded = false;
    this.statusCheckInterval = null;
  }

  /**
   * Initialize ML Service and start status monitoring
   */
  async init() {
    await this.checkStatus();
    this.startStatusMonitoring();
  }

  /**
   * Check API server health and model status
   */
  async checkStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
      
      const response = await fetch(`${this.baseUrl}/api/ml/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      this.isOnline = data.status === 'healthy';
      this.modelLoaded = data.model_loaded;
      
      this.dispatchStatusEvent({
        online: this.isOnline,
        modelLoaded: this.modelLoaded,
        timestamp: data.timestamp
      });
      
      return { online: this.isOnline, modelLoaded: this.modelLoaded };
    } catch (error) {
      this.isOnline = false;
      this.modelLoaded = false;
      
      this.dispatchStatusEvent({
        online: false,
        modelLoaded: false,
        error: error.name === 'AbortError' ? 'Connection timeout' : error.message
      });
      
      return { online: false, modelLoaded: false, error: error.message };
    }
  }

  /**
   * Start automatic status monitoring
   */
  startStatusMonitoring(interval = 30000) {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    
    this.statusCheckInterval = setInterval(() => {
      this.checkStatus();
    }, interval);
  }

  /**
   * Stop status monitoring
   */
  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  /**
   * Train LSTM model with live progress updates
   */
  async trainModel(options = {}, progressCallback = null) {
    const { epochs = 50, batchSize = 32 } = options;
    
    try {
      // Start training
      const response = await fetch(`${this.baseUrl}/api/ml/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epochs, batch_size: batchSize })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return data;
      }
      
      // Connect to progress stream if callback provided
      if (progressCallback) {
        this.streamTrainingProgress(progressCallback);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error. Is the ML API server running on port 5001?'
      };
    }
  }

  /**
   * Stream training progress using Server-Sent Events
   */
  streamTrainingProgress(progressCallback) {
    const eventSource = new EventSource(`${this.baseUrl}/api/ml/train/progress`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ignore heartbeat messages
        if (data.heartbeat) {
          return;
        }
        
        // Call progress callback
        if (progressCallback) {
          progressCallback(data);
        }
        
        // Close connection when training is complete or error
        if (data.status === 'completed' || data.status === 'error') {
          eventSource.close();
          
          // Update model status
          if (data.status === 'completed') {
            this.checkStatus();
          }
        }
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
      
      if (progressCallback) {
        progressCallback({
          status: 'error',
          message: 'Connection to training progress stream lost',
          progress: 0
        });
      }
    };
    
    return eventSource;
  }

  /**
   * Predict risk for specific location
   */
  async predictLocationRisk(lat, lng, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
      
      const payload = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        ...options
      };
      
      const response = await fetch(`${this.baseUrl}/api/ml/predict/risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please check if the ML API server is running.'
        };
      }
      return {
        success: false,
        error: error.message || 'Network error. Is the ML API server running on port 5001?'
      };
    }
  }

  /**
   * Predict risk for tourist by ID
   */
  async predictTouristRisk(touristId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
      
      const response = await fetch(`${this.baseUrl}/api/ml/predict/tourist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourist_id: touristId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please check if the ML API server is running.'
        };
      }
      return {
        success: false,
        error: error.message || 'Network error. Is the ML API server running on port 5001?'
      };
    }
  }

  /**
   * Predict hotspots for multiple locations
   */
  async predictHotspots(locations, timeWindow = 24) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/predict/hotspots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, time_window: timeWindow })
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch predict for multiple tourists
   */
  async predictBatch(touristIds) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/predict/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourist_ids: touristIds })
      });
      
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get risk level classification
   */
  getRiskLevel(riskScore) {
    if (riskScore < 0.3) return { level: 'low', color: '#22c55e', label: 'Low Risk' };
    if (riskScore < 0.6) return { level: 'medium', color: '#f59e0b', label: 'Medium Risk' };
    if (riskScore < 0.8) return { level: 'high', color: '#ef4444', label: 'High Risk' };
    return { level: 'critical', color: '#dc2626', label: 'Critical Risk' };
  }

  /**
   * Dispatch custom status event
   */
  dispatchStatusEvent(status) {
    const event = new CustomEvent('mlStatusChange', { detail: status });
    window.dispatchEvent(event);
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopStatusMonitoring();
  }
}

// Create global instance
window.mlService = new MLService();
