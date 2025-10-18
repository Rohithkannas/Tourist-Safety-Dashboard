/**
 * ML API Client for LSTM Predictions
 * Connects frontend to ML prediction service
 */

(function() {
  'use strict';

  const ML_API_BASE_URL = 'http://localhost:5001/api/ml';

  /**
   * Check if ML service is available
   */
  async function checkMLHealth() {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'healthy' && data.model_loaded;
    } catch (error) {
      console.warn('ML service not available:', error);
      return false;
    }
  }

  /**
   * Predict risk for a specific tourist by ID
   * @param {string} touristId - Tourist ID (e.g., "T000001")
   * @returns {Promise<Object>} Prediction result
   */
  async function predictTouristRisk(touristId) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/predict/tourist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tourist_id: touristId })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          touristId: data.tourist_id,
          touristName: data.tourist_name,
          riskScore: data.risk_score,
          riskLevel: data.risk_level,
          location: data.location,
          timestamp: data.timestamp
        };
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Error predicting tourist risk:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Predict risk for a specific location
   * @param {Object} location - Location object with lat, lng
   * @param {Object} timeData - Optional time data (hour, day_of_week, etc.)
   * @returns {Promise<Object>} Prediction result
   */
  async function predictLocationRisk(location, timeData = {}) {
    try {
      const now = new Date();
      const requestData = {
        lat: location.lat,
        lng: location.lng,
        hour: timeData.hour || now.getHours(),
        day_of_week: timeData.day_of_week || now.getDay(),
        day_of_month: timeData.day_of_month || now.getDate(),
        month: timeData.month || now.getMonth() + 1
      };

      const response = await fetch(`${ML_API_BASE_URL}/predict/risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          riskScore: data.risk_score,
          riskLevel: data.risk_level,
          location: data.location,
          timestamp: data.timestamp
        };
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Error predicting location risk:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Predict risk hotspots for multiple locations
   * @param {Array<Object>} locations - Array of location objects
   * @param {number} timeWindow - Hours to predict ahead (default: 24)
   * @returns {Promise<Object>} Hotspot predictions
   */
  async function predictHotspots(locations, timeWindow = 24) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/predict/hotspots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: locations,
          time_window: timeWindow
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          hotspots: data.hotspots,
          timeWindowHours: data.time_window_hours,
          timestamp: data.timestamp
        };
      } else {
        throw new Error(data.error || 'Hotspot prediction failed');
      }
    } catch (error) {
      console.error('Error predicting hotspots:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Predict risk for multiple tourists at once
   * @param {Array<string>} touristIds - Array of tourist IDs
   * @returns {Promise<Object>} Batch prediction results
   */
  async function predictBatchRisk(touristIds) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/predict/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tourist_ids: touristIds
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          predictions: data.predictions,
          total: data.total,
          timestamp: data.timestamp
        };
      } else {
        throw new Error(data.error || 'Batch prediction failed');
      }
    } catch (error) {
      console.error('Error in batch prediction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Train the ML model (admin only)
   * @param {number} epochs - Number of training epochs (default: 50)
   * @param {number} batchSize - Batch size (default: 32)
   * @returns {Promise<Object>} Training result
   */
  async function trainModel(epochs = 50, batchSize = 32) {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          epochs: epochs,
          batch_size: batchSize
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          epochs: data.epochs,
          finalLoss: data.final_loss,
          finalValLoss: data.final_val_loss
        };
      } else {
        throw new Error(data.error || 'Training failed');
      }
    } catch (error) {
      console.error('Error training model:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get risk color based on risk level
   * @param {string} riskLevel - Risk level (low, medium, high, critical)
   * @returns {string} Hex color code
   */
  function getRiskColor(riskLevel) {
    const colors = {
      'low': '#10b981',      // Green
      'medium': '#f59e0b',   // Yellow
      'high': '#f97316',     // Orange
      'critical': '#ef4444'  // Red
    };
    return colors[riskLevel] || '#6b7280'; // Gray default
  }

  /**
   * Get risk emoji based on risk level
   * @param {string} riskLevel - Risk level
   * @returns {string} Emoji
   */
  function getRiskEmoji(riskLevel) {
    const emojis = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🟠',
      'critical': '🔴'
    };
    return emojis[riskLevel] || '⚪';
  }

  /**
   * Format risk score as percentage
   * @param {number} riskScore - Risk score (0-1)
   * @returns {string} Formatted percentage
   */
  function formatRiskScore(riskScore) {
    return `${(riskScore * 100).toFixed(1)}%`;
  }

  /**
   * Display risk prediction on tourist marker
   * @param {Object} tourist - Tourist object
   * @param {Object} prediction - Prediction result
   * @returns {string} HTML content for popup
   */
  function createRiskPopupContent(tourist, prediction) {
    const emoji = getRiskEmoji(prediction.riskLevel);
    const color = getRiskColor(prediction.riskLevel);
    const scorePercent = formatRiskScore(prediction.riskScore);

    return `
      <div class="p-3 min-w-[250px]">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-lg">${tourist.name}</h3>
          <span class="text-2xl">${emoji}</span>
        </div>
        
        <div class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600">AI Risk Prediction</span>
            <span class="text-sm font-bold" style="color: ${color}">${prediction.riskLevel.toUpperCase()}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full transition-all" 
                 style="width: ${scorePercent}; background-color: ${color}">
            </div>
          </div>
          <span class="text-xs text-gray-500">${scorePercent} risk score</span>
        </div>

        <div class="text-sm space-y-1">
          <div class="flex justify-between">
            <span class="text-gray-600">Location:</span>
            <span class="font-medium">${tourist.location?.name || 'Unknown'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Tourist ID:</span>
            <span class="font-medium">${tourist.id}</span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200">
          <button onclick="viewTouristDetails('${tourist.id}')" 
                  class="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
            View Full Details
          </button>
        </div>
      </div>
    `;
  }

  // Export API
  window.MLAPI = {
    checkMLHealth,
    predictTouristRisk,
    predictLocationRisk,
    predictHotspots,
    predictBatchRisk,
    trainModel,
    getRiskColor,
    getRiskEmoji,
    formatRiskScore,
    createRiskPopupContent
  };

  console.log('✅ ML API Client loaded');

})();
