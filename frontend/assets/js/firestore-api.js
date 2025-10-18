/**
 * Firestore API Client
 * Connects to backend API that fetches data from Firebase Firestore
 * NO HARDCODED DATA - All data comes from the database
 */

(function() {
  const API_BASE = 'http://localhost:3000';
  
  // State management
  const state = {
    initialized: false,
    tourists: [],
    alerts: [],
    zones: [],
    riskAssessments: [],
    auditLogs: [],
    statistics: null,
    listeners: {
      tourists: [],
      alerts: [],
      zones: [],
      statistics: []
    }
  };

  /**
   * Get Firebase auth token from localStorage
   */
  function getAuthToken() {
    // Try to get Firebase ID token
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.idToken) {
      return user.idToken;
    }
    return null;
  }

  /**
   * Make authenticated API request
   */
  async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
      console.warn('No auth token available. User may need to login.');
      throw new Error('Authentication required');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Notify listeners of data updates
   */
  function notify(type, data) {
    if (state.listeners[type]) {
      state.listeners[type].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${type} listener:`, error);
        }
      });
    }
  }

  /**
   * Initialize API and fetch initial data
   */
  async function init() {
    if (state.initialized) {
      console.log('API already initialized');
      return;
    }

    try {
      console.log('🔄 Initializing Firestore API...');
      
      // Fetch all initial data in parallel
      const [tourists, alerts, zones, statistics] = await Promise.all([
        fetchTourists({ limit: 100, status: 'active' }),
        fetchAlerts({ limit: 50 }),
        fetchZones(),
        fetchStatistics()
      ]);

      state.tourists = tourists;
      state.alerts = alerts;
      state.zones = zones;
      state.statistics = statistics;
      state.initialized = true;

      // Notify all listeners
      notify('tourists', tourists);
      notify('alerts', alerts);
      notify('zones', zones);
      notify('statistics', statistics);

      console.log('✅ Firestore API initialized successfully');
      console.log(`   📊 Tourists: ${tourists.length}`);
      console.log(`   🚨 Alerts: ${alerts.length}`);
      console.log(`   🔒 Zones: ${zones.length}`);

      return { tourists, alerts, zones, statistics };
    } catch (error) {
      console.error('❌ Failed to initialize API:', error);
      throw error;
    }
  }

  /**
   * Fetch tourists from Firestore
   */
  async function fetchTourists(options = {}) {
    try {
      const { status, limit = 50 } = options;
      const params = new URLSearchParams();
      
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit);

      const response = await apiRequest(`/api/tourists?${params.toString()}`);
      
      if (response.success) {
        state.tourists = response.data;
        notify('tourists', response.data);
        return response.data;
      }
      
      throw new Error('Failed to fetch tourists');
    } catch (error) {
      console.error('Error fetching tourists:', error);
      throw error;
    }
  }

  /**
   * Fetch single tourist by ID
   */
  async function fetchTouristById(touristId) {
    try {
      const response = await apiRequest(`/api/tourists/${touristId}`);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Tourist not found');
    } catch (error) {
      console.error('Error fetching tourist:', error);
      throw error;
    }
  }

  /**
   * Fetch alerts from Firestore
   */
  async function fetchAlerts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await apiRequest(`/api/alerts?${queryParams}`);
      
      if (response.success) {
        state.alerts = response.data;
        notify('alerts', response.data);
        return response.data;
      }
      
      throw new Error('Failed to fetch alerts');
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  /**
   * Fetch zones from Firestore
   */
  async function fetchZones() {
    try {
      const response = await apiRequest('/api/zones');
      
      if (response.success) {
        state.zones = response.data;
        notify('zones', response.data);
        return response.data;
      }
      
      throw new Error('Failed to fetch zones');
    } catch (error) {
      console.error('Error fetching zones:', error);
      return [];
    }
  }

  /**
   * Create a new zone
   */
  async function createZone(zoneData) {
    try {
      const response = await apiRequest('/api/zones', {
        method: 'POST',
        body: JSON.stringify(zoneData)
      });
      
      if (response.success) {
        // Refresh zones
        await fetchZones();
        return response.data;
      }
      
      throw new Error('Failed to create zone');
    } catch (error) {
      console.error('Error creating zone:', error);
      throw error;
    }
  }

  /**
   * Update a zone
   */
  async function updateZone(zoneId, updates) {
    try {
      const response = await apiRequest(`/api/zones/${zoneId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (response.success) {
        // Refresh zones
        await fetchZones();
        return response.data;
      }
      
      throw new Error('Failed to update zone');
    } catch (error) {
      console.error('Error updating zone:', error);
      throw error;
    }
  }

  /**
   * Delete a zone
   */
  async function deleteZone(zoneId) {
    try {
      const response = await apiRequest(`/api/zones/${zoneId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        // Refresh zones
        await fetchZones();
        return response.data;
      }
      
      throw new Error('Failed to delete zone');
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw error;
    }
  }

  /**
   * Fetch risk assessments from Firestore
   */
  async function fetchRiskAssessments(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.district) queryParams.append('district', params.district);
      if (params.riskLevel) queryParams.append('riskLevel', params.riskLevel);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await apiRequest(`/api/risk-assessments?${queryParams}`);
      
      if (response.success) {
        state.riskAssessments = response.data;
        return response.data;
      }
      
      throw new Error('Failed to fetch risk assessments');
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
      return [];
    }
  }

  /**
   * Fetch audit logs from Firestore
   */
  async function fetchAuditLogs(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.action) queryParams.append('action', params.action);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await apiRequest(`/api/audit-logs?${queryParams}`);
      
      if (response.success) {
        state.auditLogs = response.data;
        return response.data;
      }
      
      throw new Error('Failed to fetch audit logs');
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Fetch dashboard statistics
   */
  async function fetchStatistics() {
    try {
      const response = await apiRequest('/api/statistics');
      
      if (response.success) {
        state.statistics = response.statistics;
        notify('statistics', response.statistics);
        return response.statistics;
      }
      
      throw new Error('Failed to fetch statistics');
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }

  /**
   * Register listener for data updates
   */
  function onTouristsUpdate(callback) {
    state.listeners.tourists.push(callback);
    // Immediately call with current data if available
    if (state.tourists.length > 0) {
      callback(state.tourists);
    }
  }

  function onAlertsUpdate(callback) {
    state.listeners.alerts.push(callback);
    if (state.alerts.length > 0) {
      callback(state.alerts);
    }
  }

  function onZonesUpdate(callback) {
    state.listeners.zones.push(callback);
    if (state.zones.length > 0) {
      callback(state.zones);
    }
  }

  function onStatisticsUpdate(callback) {
    state.listeners.statistics.push(callback);
    if (state.statistics) {
      callback(state.statistics);
    }
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      ...state,
      isInitialized: state.initialized
    };
  }

  /**
   * Refresh all data
   */
  async function refreshAll() {
    try {
      const [tourists, alerts, zones, statistics] = await Promise.all([
        fetchTourists({ limit: 100, status: 'active' }),
        fetchAlerts({ limit: 50 }),
        fetchZones(),
        fetchStatistics()
      ]);

      return { tourists, alerts, zones, statistics };
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  }

  /**
   * Update an alert
   */
  async function updateAlert(alertId, updates) {
    try {
      const response = await apiRequest(`/api/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (response.success) {
        // Refresh alerts
        await fetchAlerts();
        return response.data;
      }
      
      throw new Error('Failed to update alert');
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Create audit log
   */
  async function createAuditLog(logData) {
    try {
      const response = await apiRequest('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify(logData)
      });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to create audit log');
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Export API
  window.FirestoreAPI = {
    init,
    fetchTourists,
    fetchTouristById,
    fetchAlerts,
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    updateAlert,
    fetchRiskAssessments,
    fetchAuditLogs,
    createAuditLog,
    fetchStatistics,
    onTouristsUpdate,
    onAlertsUpdate,
    onZonesUpdate,
    onStatisticsUpdate,
    getState,
    refreshAll
  };

  console.log('✅ Firestore API client loaded');
})();
