(function(){
  if (!location.pathname.endsWith('dashboard.html')) return;

  // Mapbox access token from memory
  mapboxgl.accessToken = 'pk.eyJ1IjoicnJvaGl0aGthbm5hYSIsImEiOiJjbWZ0cWFqNzgwOGRqMmlwaG91aHpjbW9oIn0.ULz30NvUuWYgzuxQ_WPLGQ';

  // Initialize map focused on Meghalaya
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [91.3662, 25.4670], // Shillong, Meghalaya
    zoom: 9,
    maxBounds: [[89.5, 24.5], [93.5, 26.5]], // Restrict to Meghalaya region
    maxZoom: 18,
    minZoom: 7
  });

  // Police stations in Meghalaya with accurate coordinates
  const policeStations = [
    // East Khasi Hills District
    { name: "Shillong Police Station", lat: 25.5788, lng: 91.8933, district: "East Khasi Hills" },
    { name: "Laitumkhrah Police Station", lat: 25.5744, lng: 91.8826, district: "East Khasi Hills" },
    { name: "Lumdiengjri Police Station", lat: 25.5650, lng: 91.8750, district: "East Khasi Hills" },
    { name: "Mawlai Police Station", lat: 25.5900, lng: 91.9100, district: "East Khasi Hills" },
    { name: "Nongthymmai Police Station", lat: 25.5820, lng: 91.8900, district: "East Khasi Hills" },
    { name: "Sohra Police Station", lat: 25.3000, lng: 91.7000, district: "East Khasi Hills" },
    
    // West Khasi Hills District
    { name: "Nongstoin Police Station", lat: 25.5167, lng: 91.2667, district: "West Khasi Hills" },
    { name: "Mairang Police Station", lat: 25.5667, lng: 91.6333, district: "West Khasi Hills" },
    { name: "Ranikor Police Station", lat: 25.4167, lng: 91.1833, district: "West Khasi Hills" },
    
    // Ri-Bhoi District
    { name: "Nongpoh Police Station", lat: 25.8167, lng: 91.8833, district: "Ri-Bhoi" },
    { name: "Byrnihat Police Station", lat: 25.9833, lng: 91.9167, district: "Ri-Bhoi" },
    { name: "Umling Police Station", lat: 25.7500, lng: 91.9500, district: "Ri-Bhoi" },
    
    // West Jaintia Hills District
    { name: "Jowai Police Station", lat: 25.4522, lng: 92.2058, district: "West Jaintia Hills" },
    { name: "Thadlaskein Police Station", lat: 25.4167, lng: 92.2833, district: "West Jaintia Hills" },
    { name: "Amlarem Police Station", lat: 25.2833, lng: 92.2167, district: "West Jaintia Hills" },
    
    // East Jaintia Hills District
    { name: "Khliehriat Police Station", lat: 25.2167, lng: 92.0667, district: "East Jaintia Hills" },
    { name: "Saipung Police Station", lat: 25.1833, lng: 92.3333, district: "East Jaintia Hills" },
    
    // West Garo Hills District
    { name: "Tura Police Station", lat: 25.5167, lng: 90.2167, district: "West Garo Hills" },
    { name: "Ampati Police Station", lat: 25.1667, lng: 90.0167, district: "West Garo Hills" },
    { name: "Betasing Police Station", lat: 25.4833, lng: 90.1167, district: "West Garo Hills" },
    
    // East Garo Hills District
    { name: "Williamnagar Police Station", lat: 25.4833, lng: 90.6167, district: "East Garo Hills" },
    { name: "Rongjeng Police Station", lat: 25.4167, lng: 90.5333, district: "East Garo Hills" },
    { name: "Samanda Police Station", lat: 25.3833, lng: 90.7167, district: "East Garo Hills" },
    
    // North Garo Hills District
    { name: "Resubelpara Police Station", lat: 25.4833, lng: 90.3167, district: "North Garo Hills" },
    { name: "Bajengdoba Police Station", lat: 25.5500, lng: 90.4167, district: "North Garo Hills" },
    
    // South Garo Hills District
    { name: "Baghmara Police Station", lat: 25.1833, lng: 90.6333, district: "South Garo Hills" },
    { name: "Chokpot Police Station", lat: 25.0833, lng: 90.5833, district: "South Garo Hills" },
    
    // South West Garo Hills District
    { name: "Tikrikilla Police Station", lat: 25.2500, lng: 90.1833, district: "South West Garo Hills" },
    { name: "Betasing Police Station", lat: 25.2167, lng: 90.1167, district: "South West Garo Hills" },
    
    // South West Khasi Hills District
    { name: "Mawkyrwat Police Station", lat: 25.3000, lng: 91.5000, district: "South West Khasi Hills" },
    { name: "Ranikor Police Station", lat: 25.2833, lng: 91.1833, district: "South West Khasi Hills" }
  ];

  const markers = new Map(); // touristId -> marker
  let currentPopup = null;
  let heatmapVisible = false;
  let satelliteView = false;

  // Wait for map to load
  map.on('load', function() {
    // Add police stations
    addPoliceStations();
    
    // Add risk zones
    addRiskZones();
    
    // Initialize controls
    initializeControls();
    
    // Load initial data
    loadTouristData();
  });

  function addPoliceStations() {
    // Add police station markers
    policeStations.forEach((station, index) => {
      // Create a DOM element for the marker
      const el = document.createElement('div');
      el.className = 'police-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: #3b82f6;
        border: 2px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;
      
      // Add police icon
      el.innerHTML = `
        <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clip-rule="evenodd"/>
        </svg>
      `;

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        el.style.background = '#2563eb';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.background = '#3b82f6';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([station.lng, station.lat])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 bg-gray-900 text-white rounded-lg border border-gray-700">
          <h3 class="font-semibold text-sm mb-2 text-blue-400">${station.name}</h3>
          <p class="text-xs text-gray-300 mb-1">District: ${station.district}</p>
          <p class="text-xs text-gray-400">Coordinates: ${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}</p>
          <div class="mt-2 pt-2 border-t border-gray-700">
            <button class="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white transition-colors">
              Contact Station
            </button>
          </div>
        </div>
      `);

      el.addEventListener('click', () => {
        if (currentPopup) currentPopup.remove();
        currentPopup = popup;
        popup.setLngLat([station.lng, station.lat]).addTo(map);
      });
    });
  }

  function addRiskZones() {
    // Risk zones data for Meghalaya
    const riskZones = [
      // High Risk Zones
      {
        id: 'high-risk-1',
        type: 'high',
        center: [91.8933, 25.5788],
        radius: 2000,
        name: 'Cherrapunji Flood Zone'
      },
      {
        id: 'high-risk-2', 
        type: 'high',
        center: [90.2167, 25.5900],
        radius: 1500,
        name: 'Tura Hill Landslide Area'
      },
      
      // Medium Risk Zones
      {
        id: 'medium-risk-1',
        type: 'medium',
        center: [92.2058, 25.4522],
        radius: 2500,
        name: 'Jowai Construction Zone'
      },
      {
        id: 'medium-risk-2',
        type: 'medium',
        center: [91.8833, 25.8167],
        radius: 1800,
        name: 'Nongpoh Traffic Area'
      },
      {
        id: 'medium-risk-3',
        type: 'medium',
        center: [91.2667, 25.5167],
        radius: 2200,
        name: 'Nongstoin Weather Zone'
      },
      
      // Low Risk Zones
      {
        id: 'low-risk-1',
        type: 'low',
        center: [91.3662, 25.4670],
        radius: 3000,
        name: 'Shillong Safe Zone'
      },
      {
        id: 'low-risk-2',
        type: 'low',
        center: [90.6167, 25.4833],
        radius: 2800,
        name: 'Williamnagar Tourist Center'
      },
      {
        id: 'low-risk-3',
        type: 'low',
        center: [91.5000, 25.3000],
        radius: 2000,
        name: 'Mawkyrwat Safe Area'
      }
    ];

    riskZones.forEach(zone => {
      const color = zone.type === 'high' ? '#ef4444' : 
                   zone.type === 'medium' ? '#f59e0b' : '#22c55e';
      
      // Create circle source
      const circleGeoJSON = createCircle(zone.center, zone.radius);
      
      map.addSource(zone.id, {
        type: 'geojson',
        data: circleGeoJSON
      });

      // Add circle layer
      map.addLayer({
        id: zone.id,
        type: 'fill',
        source: zone.id,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.2
        }
      });

      // Add circle border
      map.addLayer({
        id: zone.id + '-border',
        type: 'line',
        source: zone.id,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add click handler for zone info
      map.on('click', zone.id, (e) => {
        if (currentPopup) currentPopup.remove();
        
        currentPopup = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-3 bg-gray-900 text-white rounded-lg border border-gray-700">
              <h3 class="font-semibold text-sm mb-2" style="color: ${color}">${zone.name}</h3>
              <p class="text-xs text-gray-300 mb-1">Risk Level: ${zone.type.toUpperCase()}</p>
              <p class="text-xs text-gray-400">Radius: ${(zone.radius/1000).toFixed(1)}km</p>
            </div>
          `)
          .addTo(map);
      });

      // Change cursor on hover
      map.on('mouseenter', zone.id, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', zone.id, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }

  // Helper function to create circle GeoJSON
  function createCircle(center, radiusInMeters) {
    const points = 64;
    const coords = [];
    const distanceX = radiusInMeters / (111320 * Math.cos(center[1] * Math.PI / 180));
    const distanceY = radiusInMeters / 110540;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]); // Close the circle

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };
  }

  function initializeControls() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
      map.zoomIn();
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
      map.zoomOut();
    });

    // Satellite toggle
    document.getElementById('toggleSatellite').addEventListener('click', () => {
      satelliteView = !satelliteView;
      const style = satelliteView ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/dark-v11';
      map.setStyle(style);
      
      // Re-add sources and layers after style change
      map.once('styledata', () => {
        addPoliceStations();
        addRiskZones();
        if (heatmapVisible) {
          addTouristHeatmap();
        }
      });
    });

    // Heatmap toggle
    document.getElementById('toggleHeatmap').addEventListener('click', () => {
      heatmapVisible = !heatmapVisible;
      if (heatmapVisible) {
        addTouristHeatmap();
      } else {
        removeTouristHeatmap();
      }
    });

    // Locate me
    document.getElementById('locateMe').addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000
          });
          
          // Add user location marker
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat([longitude, latitude])
            .addTo(map);
        });
      }
    });

    // State filter
    document.getElementById('stateFilter').addEventListener('change', (e) => {
      const state = e.target.value;
      let center, zoom;
      
      switch(state) {
        case 'meghalaya':
          center = [91.3662, 25.4670];
          zoom = 9;
          break;
        case 'rajasthan':
          center = [75.7873, 26.9124];
          zoom = 7;
          break;
        case 'maharashtra':
          center = [72.8777, 19.0760];
          zoom = 7;
          break;
        default:
          center = [78.96, 22.5];
          zoom = 5;
      }
      
      map.flyTo({ center, zoom, duration: 2000 });
    });
  }

  function loadTouristData() {
    // Load tourist data and render markers
    if (window.DEMO_DATA) {
      const tourists = window.DEMO_DATA.getTourists();
      renderTourists(tourists);
    }
    
    // Subscribe to API updates if available
    if (window.API) {
      window.API.onTouristsUpdate((tourists) => {
        renderTourists(tourists);
      });
      
      window.API.onAlertsUpdate((alerts) => {
        const state = window.API.getState();
        renderAlertsList(alerts, state.tourists || []);
      });
    }
  }

  function renderTourists(tourists) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers.clear();

    tourists.forEach(tourist => {
      const color = getTouristColor(tourist);
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'tourist-marker';
      el.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${color};
        border: 2px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 0 4px rgba(255,255,255,0.2);
        transition: all 0.2s ease;
      `;

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([tourist.coord[1], tourist.coord[0]])
        .addTo(map);

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3 bg-gray-900 text-white rounded-lg border border-gray-700">
            <h3 class="font-semibold text-sm mb-2">${tourist.name}</h3>
            <p class="text-xs text-gray-300 mb-1">ID: ${tourist.id}</p>
            <p class="text-xs text-gray-300 mb-1">Phone: ${tourist.phone}</p>
            <p class="text-xs text-gray-400">Status: ${tourist.status.toUpperCase()}</p>
            ${tourist.status === 'sos' ? `
              <div class="mt-2 pt-2 border-t border-gray-700">
                <button class="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white transition-colors" onclick="openProfile('${tourist.id}')">
                  View Details
                </button>
              </div>
            ` : ''}
          </div>
        `);

      el.addEventListener('click', () => {
        if (currentPopup) currentPopup.remove();
        currentPopup = popup;
        popup.setLngLat([tourist.coord[1], tourist.coord[0]]).addTo(map);
      });

      markers.set(tourist.id, marker);
    });
  }

  function getTouristColor(tourist) {
    if (tourist.status === 'sos') return '#ef4444';
    // Add logic for restricted zones if needed
    return '#3b82f6';
  }

  function addTouristHeatmap() {
    if (window.DEMO_DATA) {
      const tourists = window.DEMO_DATA.getTourists();
      const heatmapData = {
        type: 'FeatureCollection',
        features: tourists.map(tourist => ({
          type: 'Feature',
          properties: {
            weight: tourist.status === 'sos' ? 3 : 1
          },
          geometry: {
            type: 'Point',
            coordinates: [tourist.coord[1], tourist.coord[0]]
          }
        }))
      };

      map.addSource('tourist-heatmap', {
        type: 'geojson',
        data: heatmapData
      });

      map.addLayer({
        id: 'tourist-heatmap-layer',
        type: 'heatmap',
        source: 'tourist-heatmap',
        maxzoom: 15,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': {
            stops: [
              [11, 1],
              [15, 3]
            ]
          },
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': {
            stops: [
              [11, 15],
              [15, 20]
            ]
          }
        }
      });
    }
  }

  function removeTouristHeatmap() {
    if (map.getLayer('tourist-heatmap-layer')) {
      map.removeLayer('tourist-heatmap-layer');
    }
    if (map.getSource('tourist-heatmap')) {
      map.removeSource('tourist-heatmap');
    }
  }

  // SOS side panel functions
  const sosListEl = document.getElementById('sosList');
  const sosCountEl = document.getElementById('sosCount');

  function renderAlertsList(alerts, tourists) {
    const active = alerts.filter(a => a.status === 'active' || a.status === 'ack');
    sosCountEl.textContent = String(active.length);
    sosListEl.innerHTML = '';
    
    const tMap = new Map(tourists.map(t => [t.id, t]));
    
    active.sort((a, b) => b.createdAt - a.createdAt).forEach(a => {
      const t = tMap.get(a.touristId);
      const item = document.createElement('button');
      item.className = 'w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10';
      item.innerHTML = `
        <div class='flex items-center justify-between'>
          <div>
            <div class='font-semibold text-red-400'>SOS • ${t?.name || a.touristId}</div>
            <div class='text-xs text-white/70'>ID: ${a.touristId}</div>
          </div>
          <div class='text-xs ${a.status === 'ack' ? 'text-yellow-300' : 'text-red-300'}'>${a.status.toUpperCase()}</div>
        </div>
      `;
      item.addEventListener('click', () => openProfile(a.touristId, a.id));
      sosListEl.appendChild(item);
    });
  }

  // Modal functions
  const modal = document.getElementById('profileModal');
  const closeModal = document.getElementById('closeModal');
  let currentAlertId = null;

  function openProfile(touristId, alertId) {
    const tourist = getTouristById(touristId);
    if (!tourist) return;
    
    document.getElementById('p_id').textContent = tourist.id;
    document.getElementById('p_name').textContent = tourist.name;
    document.getElementById('p_phone').textContent = tourist.phone;
    document.getElementById('p_emg').textContent = tourist.emg;
    currentAlertId = alertId;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Initialize trail map
    setTimeout(() => {
      const trailMapContainer = document.getElementById('trailMap');
      trailMapContainer.innerHTML = '';
      
      const trailMap = new mapboxgl.Map({
        container: 'trailMap',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [tourist.coord[1], tourist.coord[0]],
        zoom: 14
      });

      // Add trail line
      trailMap.on('load', () => {
        const trailCoords = tourist.trail.map(coord => [coord[1], coord[0]]);
        
        trailMap.addSource('trail', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: trailCoords
            }
          }
        });

        trailMap.addLayer({
          id: 'trail',
          type: 'line',
          source: 'trail',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#60a5fa',
            'line-width': 3
          }
        });

        // Add current position marker
        new mapboxgl.Marker({ color: getTouristColor(tourist) })
          .setLngLat([tourist.coord[1], tourist.coord[0]])
          .addTo(trailMap);
      });
    }, 100);
  }

  function getTouristById(id) {
    if (window.DEMO_DATA) {
      return window.DEMO_DATA.getTourists().find(t => t.id === id);
    }
    return null;
  }

  function closeProfileModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('trailMap').innerHTML = '';
    currentAlertId = null;
  }

  // Event listeners
  closeModal.addEventListener('click', closeProfileModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProfileModal();
  });

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) return;
        
        const tourists = window.DEMO_DATA ? window.DEMO_DATA.getTourists() : [];
        const tourist = tourists.find(t => t.id === query || t.phone === query);
        
        if (tourist) {
          map.flyTo({
            center: [tourist.coord[1], tourist.coord[0]],
            zoom: 16,
            duration: 2000
          });
          
          // Open popup for found tourist
          setTimeout(() => {
            const marker = markers.get(tourist.id);
            if (marker) {
              marker.getElement().click();
            }
          }, 2000);
        }
      }
    });
  }

  // Make openProfile globally available
  window.openProfile = openProfile;

  // Show loading indicator initially
  const loadingIndicator = document.getElementById('mapLoading');
  loadingIndicator.style.opacity = '1';
  loadingIndicator.style.pointerEvents = 'auto';

  // Hide loading indicator when map is loaded
  map.on('idle', () => {
    loadingIndicator.style.opacity = '0';
    loadingIndicator.style.pointerEvents = 'none';
  });

})();
