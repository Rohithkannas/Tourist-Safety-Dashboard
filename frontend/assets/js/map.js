/**
 * Tourist Safety Dashboard - Interactive Map Module
 * Handles Mapbox GL JS integration with police stations and hospitals
 */
(function() {
  if (!location.pathname.endsWith('dashboard.html')) return;

  // Configuration
  const CONFIG = {
    accessToken: 'pk.eyJ1IjoicnJvaGl0aGthbm5hYSIsImEiOiJjbWZ0cWFqNzgwOGRqMmlwaG91aHpjbW9oIn0.ULz30NvUuWYgzuxQ_WPLGQ',
    bounds: [89.5, 24.5, 93.5, 26.5],
    center: [91.3662, 25.4670],
    zoom: 7.2,
    minZoom: 6.5,
    maxZoom: 18
  };

  // Layer definitions
  const LAYERS = {
    police: {
      source: 'police-src',
      clusters: 'police-clusters',
      clusterCount: 'police-cluster-count',
      unclustered: 'police-unclustered'
    },
    hospital: {
      source: 'hospital-src',
      clusters: 'hospital-clusters',
      clusterCount: 'hospital-cluster-count',
      unclustered: 'hospital-unclustered'
    }
  };

  let map = null;
  let locations = [];

  // Initialize Mapbox
  mapboxgl.accessToken = CONFIG.accessToken;

  // Create map instance
  function createMap() {
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: CONFIG.center,
      zoom: CONFIG.zoom,
      maxBounds: [[CONFIG.bounds[0], CONFIG.bounds[1]], [CONFIG.bounds[2], CONFIG.bounds[3]]],
      minZoom: CONFIG.minZoom,
      maxZoom: CONFIG.maxZoom
    });
    
    // Expose map instance globally for search functionality
    window.dashboardMap = map;
  }

  // Add map controls
  function addControls() {
    // Navigation controls
    map.addControl(new mapboxgl.NavigationControl({ 
      showCompass: false,
      visualizePitch: true 
    }), 'bottom-right');

    // Geocoder with Meghalaya restriction
    if (typeof MapboxGeocoder !== 'undefined') {
      const geocoder = new MapboxGeocoder({
        accessToken: CONFIG.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        bbox: CONFIG.bounds,
        countries: 'in',
        placeholder: 'Search places in Meghalaya...',
        proximity: { longitude: CONFIG.center[0], latitude: CONFIG.center[1] }
      });
      map.addControl(geocoder, 'top-left');
    }
  }

  // Load location data
  async function loadLocations() {
    try {
      const resp = await fetch('./assets/data/locations.json', { cache: 'no-cache' });
      if (resp.ok) {
        const data = await resp.json();
        return data;
      }
    } catch(e) {
      console.warn('Failed to load locations.json:', e);
    }

    // Fallback to Firestore if available
    try {
      if (window.firebase && firebase.firestore) {
        const db = firebase.firestore();
        const snap = await db.collection('locations').get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
    } catch (e) {
      console.warn('Firestore fallback failed:', e);
    }

    return [];
  }

  // Convert location data to GeoJSON FeatureCollection
  function toFeatureCollection(items) {
    return {
      type: 'FeatureCollection',
      features: items.map(item => ({
        type: 'Feature',
        properties: {
          name: item.name || '',
          type: item.type || '',
          address: item.address || ''
        },
        geometry: { 
          type: 'Point', 
          coordinates: [Number(item.longitude), Number(item.latitude)] 
        }
      }))
    };
  }

  function addSourcesAndLayers(policeFc, hospitalFc){
    // Sources with clustering enabled
    map.addSource(LAYERS.police.source, {
      type: 'geojson',
      data: policeFc,
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 14
    });
    map.addSource(LAYERS.hospital.source, {
      type: 'geojson',
      data: hospitalFc,
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 14
    });

    // Cluster layers (police - blue)
    map.addLayer({
      id: LAYERS.police.clusters,
      type: 'circle',
      source: LAYERS.police.source,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#3b82f6',
        'circle-opacity': 0.25,
        'circle-stroke-color': '#3b82f6',
        'circle-stroke-width': 1.5,
        'circle-radius': [
          'step', ['get', 'point_count'],
          14, 10, 18, 25, 24
        ]
      }
    });

    map.addLayer({
      id: LAYERS.police.clusterCount,
      type: 'symbol',
      source: LAYERS.police.source,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: { 'text-color': '#93c5fd' }
    });

    // Unclustered police points
    map.addLayer({
      id: LAYERS.police.unclustered,
      type: 'symbol',
      source: LAYERS.police.source,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'police-15',
        'icon-allow-overlap': true,
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          7, 0.9,
          12, 1.1,
          16, 1.25
        ]
      }
    });

    // Cluster layers (hospital - red)
    map.addLayer({
      id: LAYERS.hospital.clusters,
      type: 'circle',
      source: LAYERS.hospital.source,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ef4444',
        'circle-opacity': 0.25,
        'circle-stroke-color': '#ef4444',
        'circle-stroke-width': 1.5,
        'circle-radius': [
          'step', ['get', 'point_count'],
          14, 10, 18, 25, 24
        ]
      }
    });

    map.addLayer({
      id: LAYERS.hospital.clusterCount,
      type: 'symbol',
      source: LAYERS.hospital.source,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: { 'text-color': '#fecaca' }
    });

    // Unclustered hospital points
    map.addLayer({
      id: LAYERS.hospital.unclustered,
      type: 'symbol',
      source: LAYERS.hospital.source,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'hospital-15',
        'icon-allow-overlap': true,
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          7, 0.9,
          12, 1.1,
          16, 1.25
        ]
      }
    });

    // Cluster click to zoom
    map.on('click', LAYERS.police.clusters, (e) => expandCluster(e, LAYERS.police.source));
    map.on('click', LAYERS.hospital.clusters, (e) => expandCluster(e, LAYERS.hospital.source));

    // Popups for unclustered
    map.on('click', LAYERS.police.unclustered, (e) => showPopup(e));
    map.on('click', LAYERS.hospital.unclustered, (e) => showPopup(e));

    // Cursor change on hover
    [LAYERS.police.clusters, LAYERS.police.unclustered, LAYERS.hospital.clusters, LAYERS.hospital.unclustered]
    .forEach(id => {
      map.on('mouseenter', id, () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', id, () => map.getCanvas().style.cursor = '');
    });
  }

  function expandCluster(e, sourceId){
    const features = map.queryRenderedFeatures(e.point, { layers: [e.features[0].layer.id] });
    const clusterId = features[0].properties.cluster_id;
    map.getSource(sourceId).getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({ center: features[0].geometry.coordinates, zoom });
    });
  }

  function showPopup(e){
    const f = e.features[0];
    const coords = f.geometry.coordinates.slice();
    const name = f.properties.name || 'Unknown';
    const addr = f.properties.address || '';
    const type = f.properties.type || '';
    const color = type === 'police' ? '#3b82f6' : '#ef4444';
    new mapboxgl.Popup({ offset: 12 })
      .setLngLat(coords)
      .setHTML(`
        <div class="p-3 bg-gray-900 text-white rounded-lg border border-gray-700">
          <h3 class="font-semibold text-sm mb-1" style="color:${color}">${name}</h3>
          ${addr ? `<p class="text-xs text-gray-300">${addr}</p>` : ''}
        </div>
      `)
      .addTo(map);
  }

  function applyFilter(val){
    const showPolice = (val === 'all' || val === 'police');
    const showHospital = (val === 'all' || val === 'hospital');

    map.setLayoutProperty(LAYERS.police.clusters, 'visibility', showPolice ? 'visible' : 'none');
    map.setLayoutProperty(LAYERS.police.clusterCount, 'visibility', showPolice ? 'visible' : 'none');
    map.setLayoutProperty(LAYERS.police.unclustered, 'visibility', showPolice ? 'visible' : 'none');

    map.setLayoutProperty(LAYERS.hospital.clusters, 'visibility', showHospital ? 'visible' : 'none');
    map.setLayoutProperty(LAYERS.hospital.clusterCount, 'visibility', showHospital ? 'visible' : 'none');
    map.setLayoutProperty(LAYERS.hospital.unclustered, 'visibility', showHospital ? 'visible' : 'none');
  }

  function attachFilter(){
    const sel = document.getElementById('placeFilter');
    if (!sel) return;
    sel.addEventListener('change', () => applyFilter(sel.value));
  }

  // Initialize map and load data
  async function init() {
    createMap();
    addControls();
    
    map.on('load', async () => {
      const items = await loadLocations();
      const police = items.filter(x => (x.type||'').toLowerCase() === 'police');
      const hospital = items.filter(x => (x.type||'').toLowerCase() === 'hospital');

      const policeFc = toFeatureCollection(police);
      const hospitalFc = toFeatureCollection(hospital);

      addSourcesAndLayers(policeFc, hospitalFc);
      attachFilter();
      applyFilter('all');

      // Update legend counts
      updateLegendCounts(police.length, hospital.length);

      // Ensure proper sizing on container resize
      setTimeout(() => map.resize(), 100);
      window.addEventListener('resize', () => map.resize());
    });
  }

  // Update legend and filter counts with actual data
  function updateLegendCounts(policeCount, hospitalCount) {
    // Update legend counts
    const policeCountEl = document.querySelector('#mapLegend .text-blue-400');
    const hospitalCountEl = document.querySelector('#mapLegend .text-red-400');
    
    if (policeCountEl) policeCountEl.textContent = policeCount;
    if (hospitalCountEl) hospitalCountEl.textContent = hospitalCount;

    // Update filter section counts
    const filterPoliceCount = document.getElementById('policeCount');
    const filterHospitalCount = document.getElementById('hospitalCount');
    
    if (filterPoliceCount) filterPoliceCount.textContent = policeCount;
    if (filterHospitalCount) filterHospitalCount.textContent = hospitalCount;
  }

  // Start the application
  init();
})();
