# 📡 API Documentation

Complete API reference for the SafeGuard Tourist Safety Dashboard backend.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
- [Socket.IO Events](#socketio-events)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Overview

The SafeGuard backend provides a RESTful API for managing tourist data, emergency alerts, and safety zones. Real-time updates are delivered via Socket.IO for live monitoring.

### API Version

Current Version: **v1.0**

### Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operation successful",
  "timestamp": "2025-10-18T05:00:00.000Z"
}
```

## Base URL

### Development
```
http://localhost:4000
```

### Production
```
https://api.safeguard-meghalaya.com
```

## Authentication

Currently, the API uses Firebase Authentication tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <firebase-token>
```

### Getting a Token

1. Authenticate with Firebase on the frontend
2. Retrieve the ID token:
```javascript
const token = await firebase.auth().currentUser.getIdToken();
```

3. Include in API requests:
```javascript
fetch('/api/tourists', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## REST API Endpoints

### Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T05:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

### Get All Tourists

Retrieve a list of all tourists currently in the system.

**Endpoint:** `GET /api/tourists`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `active`, `inactive`, `sos` |
| `zone` | string | No | Filter by zone ID |
| `limit` | number | No | Limit results (default: 100) |
| `offset` | number | No | Pagination offset (default: 0) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "T001",
      "name": "John Doe",
      "nationality": "USA",
      "phone": "+1-555-0123",
      "location": {
        "lat": 25.5788,
        "lng": 91.8933
      },
      "status": "active",
      "lastSeen": "2025-10-18T04:55:00.000Z",
      "inRestrictedZone": false,
      "sosActive": false
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

---

### Get Tourist by ID

Retrieve details of a specific tourist.

**Endpoint:** `GET /api/tourists/:id`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Tourist ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "T001",
    "name": "John Doe",
    "nationality": "USA",
    "passport": "US1234567",
    "phone": "+1-555-0123",
    "email": "john.doe@example.com",
    "location": {
      "lat": 25.5788,
      "lng": 91.8933,
      "accuracy": 10
    },
    "status": "active",
    "checkInDate": "2025-10-15T10:00:00.000Z",
    "hotel": "Hotel Pine Borough",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1-555-0124",
      "relation": "Spouse"
    },
    "visitedPlaces": ["Shillong", "Cherrapunji"],
    "lastSeen": "2025-10-18T04:55:00.000Z"
  }
}
```

---

### Get All Alerts

Retrieve all emergency alerts.

**Endpoint:** `GET /api/alerts`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `pending`, `acknowledged`, `resolved` |
| `priority` | string | No | Filter by priority: `low`, `medium`, `high`, `critical` |
| `type` | string | No | Filter by type: `sos`, `medical`, `security`, `other` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "A001",
      "touristId": "T001",
      "touristName": "John Doe",
      "type": "sos",
      "priority": "critical",
      "status": "pending",
      "location": {
        "lat": 25.5788,
        "lng": 91.8933,
        "address": "Police Bazar, Shillong"
      },
      "message": "Emergency assistance needed",
      "timestamp": "2025-10-18T04:50:00.000Z",
      "acknowledgedBy": null,
      "acknowledgedAt": null,
      "resolvedBy": null,
      "resolvedAt": null
    }
  ],
  "total": 25
}
```

---

### Acknowledge Alert

Mark an alert as acknowledged.

**Endpoint:** `POST /api/alerts/:id/acknowledge`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Alert ID |

**Request Body:**
```json
{
  "officerId": "OFF123",
  "officerName": "Officer Smith",
  "notes": "En route to location"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "A001",
    "status": "acknowledged",
    "acknowledgedBy": "OFF123",
    "acknowledgedAt": "2025-10-18T05:00:00.000Z"
  },
  "message": "Alert acknowledged successfully"
}
```

---

### Resolve Alert

Mark an alert as resolved.

**Endpoint:** `POST /api/alerts/:id/resolve`

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Alert ID |

**Request Body:**
```json
{
  "officerId": "OFF123",
  "officerName": "Officer Smith",
  "resolution": "Tourist located and safe",
  "notes": "False alarm, tourist was lost"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "A001",
    "status": "resolved",
    "resolvedBy": "OFF123",
    "resolvedAt": "2025-10-18T05:15:00.000Z",
    "resolution": "Tourist located and safe"
  },
  "message": "Alert resolved successfully"
}
```

---

### Get Restricted Zones

Retrieve all restricted zones.

**Endpoint:** `GET /api/restricted`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": "Z001",
        "name": "Border Area",
        "type": "restricted",
        "polygon": [
          [25.5788, 91.8933],
          [25.5800, 91.8950],
          [25.5780, 91.8960],
          [25.5788, 91.8933]
        ],
        "description": "Restricted military zone",
        "createdAt": "2025-10-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### Create Geofence

Create a new geofence zone.

**Endpoint:** `POST /api/geofence`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Safety Zone 1",
  "type": "safe",
  "shape": "polygon",
  "coordinates": [
    [25.5788, 91.8933],
    [25.5800, 91.8950],
    [25.5780, 91.8960],
    [25.5788, 91.8933]
  ],
  "description": "Tourist safe zone",
  "color": "#00ff00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "GF001",
    "name": "Safety Zone 1",
    "type": "safe",
    "createdAt": "2025-10-18T05:00:00.000Z"
  },
  "message": "Geofence created successfully"
}
```

---

### Get Police Stations

Retrieve all police stations.

**Endpoint:** `GET /api/police-stations`

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `district` | string | No | Filter by district |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PS001",
      "name": "Shillong Police Station",
      "district": "East Khasi Hills",
      "location": {
        "lat": 25.5788,
        "lng": 91.8933
      },
      "address": "Police Bazar, Shillong",
      "phone": "+91-364-2222222",
      "email": "shillong.ps@megpolice.gov.in"
    }
  ],
  "total": 32
}
```

---

### Get Hospitals

Retrieve all hospitals.

**Endpoint:** `GET /api/hospitals`

**Authentication:** Not required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `district` | string | No | Filter by district |
| `type` | string | No | Filter by type: `government`, `private`, `chc`, `phc` |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "H001",
      "name": "NEIGRIHMS",
      "type": "government",
      "district": "East Khasi Hills",
      "location": {
        "lat": 25.5788,
        "lng": 91.8933
      },
      "address": "Mawdiangdiang, Shillong",
      "phone": "+91-364-2538014",
      "emergency": "+91-364-2538015",
      "facilities": ["Emergency", "ICU", "Surgery", "Trauma"]
    }
  ],
  "total": 24
}
```

## Socket.IO Events

### Connection

Establish a Socket.IO connection.

```javascript
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

### Tourists Update

Receive real-time tourist location updates.

**Event:** `tourists:update`

**Direction:** Server → Client

**Payload:**
```json
{
  "tourists": [
    {
      "id": "T001",
      "name": "John Doe",
      "location": {
        "lat": 25.5788,
        "lng": 91.8933
      },
      "status": "active",
      "lastSeen": "2025-10-18T05:00:00.000Z"
    }
  ],
  "timestamp": "2025-10-18T05:00:00.000Z"
}
```

**Example:**
```javascript
socket.on('tourists:update', (data) => {
  console.log('Tourist update:', data);
  updateMapMarkers(data.tourists);
});
```

---

### Alerts Update

Receive real-time alert updates.

**Event:** `alerts:update`

**Direction:** Server → Client

**Payload:**
```json
{
  "alert": {
    "id": "A001",
    "type": "sos",
    "status": "pending",
    "touristId": "T001",
    "location": {
      "lat": 25.5788,
      "lng": 91.8933
    },
    "timestamp": "2025-10-18T05:00:00.000Z"
  },
  "action": "created"
}
```

**Example:**
```javascript
socket.on('alerts:update', (data) => {
  console.log('Alert update:', data);
  if (data.action === 'created') {
    showAlertNotification(data.alert);
  }
});
```

---

### Zone Breach

Receive notification when tourist enters restricted zone.

**Event:** `zone:breach`

**Direction:** Server → Client

**Payload:**
```json
{
  "touristId": "T001",
  "touristName": "John Doe",
  "zoneId": "Z001",
  "zoneName": "Border Area",
  "location": {
    "lat": 25.5788,
    "lng": 91.8933
  },
  "timestamp": "2025-10-18T05:00:00.000Z"
}
```

## Data Models

### Tourist Model

```typescript
interface Tourist {
  id: string;
  name: string;
  nationality: string;
  passport: string;
  phone: string;
  email: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  status: 'active' | 'inactive' | 'sos';
  checkInDate: string;
  checkOutDate?: string;
  hotel: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  visitedPlaces: string[];
  lastSeen: string;
  inRestrictedZone: boolean;
  sosActive: boolean;
}
```

### Alert Model

```typescript
interface Alert {
  id: string;
  touristId: string;
  touristName: string;
  type: 'sos' | 'medical' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  message: string;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  notes?: string;
}
```

### Zone Model

```typescript
interface Zone {
  id: string;
  name: string;
  type: 'restricted' | 'caution' | 'safe';
  shape: 'polygon' | 'circle' | 'square';
  coordinates: number[][];
  description: string;
  color: string;
  createdAt: string;
  createdBy: string;
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Tourist with ID T999 not found",
    "details": {}
  },
  "timestamp": "2025-10-18T05:00:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

### Limits

- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour
- **WebSocket**: No limit on connections

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1697601600
```

## Examples

### Fetch Tourists with JavaScript

```javascript
async function fetchTourists() {
  try {
    const token = await getAuthToken();
    const response = await fetch('http://localhost:4000/api/tourists', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Tourists:', data.data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### Acknowledge Alert

```javascript
async function acknowledgeAlert(alertId) {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `http://localhost:4000/api/alerts/${alertId}/acknowledge`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          officerId: 'OFF123',
          officerName: 'Officer Smith',
          notes: 'Responding to alert'
        })
      }
    );
    
    const data = await response.json();
    console.log('Alert acknowledged:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Socket.IO Connection

```javascript
const socket = io('http://localhost:4000');

// Connection events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Data events
socket.on('tourists:update', (data) => {
  updateTouristMarkers(data.tourists);
});

socket.on('alerts:update', (data) => {
  handleAlertUpdate(data.alert, data.action);
});

socket.on('zone:breach', (data) => {
  showZoneBreachNotification(data);
});
```

---

**API Version**: 1.0  
**Last Updated**: October 2025  
**Support**: Open an issue on GitHub for API questions
