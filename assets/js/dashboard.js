(function(){
  if (!location.pathname.endsWith('dashboard.html')) return;

  // Map init
  const map = L.map('map').setView([26.9124, 75.7873], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  const cluster = L.markerClusterGroup();
  map.addLayer(cluster);

  let restrictedPoly = null;
  let restrictedCoords = [];

  const markers = new Map(); // touristId -> marker

  function inRestricted(latlng){
    if (!restrictedPoly || !restrictedCoords.length || !window.leafletPip) return false;
    return leafletPip.pointInLayer([latlng[1], latlng[0]], restrictedPoly).length>0;
  }

  function colorFor(t){
    if (t.status === 'sos') return 'red';
    if (inRestricted(t.coord)) return 'orange';
    return 'blue';
  }

  function markerIcon(color){
    const c = { red: '#ef4444', orange: '#f59e0b', blue: '#3b82f6' }[color] || '#3b82f6';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:12px;height:12px;border-radius:50%;background:${c};box-shadow:0 0 0 4px rgba(255,255,255,0.2);"></div>`
    });
  }

  function upsertMarker(t){
    const m = markers.get(t.id);
    const icon = markerIcon(colorFor(t));
    if (m){
      m.setLatLng(t.coord);
      m.setIcon(icon);
    } else {
      const marker = L.marker(t.coord, { icon });
      marker.bindPopup(`<div><div class='font-semibold mb-1'>${t.name}</div><div class='text-xs text-gray-600'>${t.id}</div></div>`);
      cluster.addLayer(marker);
      markers.set(t.id, marker);
    }
  }

  function renderTourists(tourists){
    tourists.forEach(upsertMarker);
  }

  // SOS side panel
  const sosListEl = document.getElementById('sosList');
  const sosCountEl = document.getElementById('sosCount');

  function renderAlertsList(alerts, tourists){
    const active = alerts.filter(a=>a.status==='active' || a.status==='ack');
    sosCountEl.textContent = String(active.length);
    sosListEl.innerHTML = '';
    const tMap = new Map(tourists.map(t=>[t.id, t]));
    active.sort((a,b)=>b.createdAt-a.createdAt).forEach(a => {
      const t = tMap.get(a.touristId);
      const item = document.createElement('button');
      item.className = 'w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10';
      item.innerHTML = `<div class='flex items-center justify-between'>
        <div>
          <div class='font-semibold text-red-400'>SOS • ${t?.name||a.touristId}</div>
          <div class='text-xs text-white/70'>ID: ${a.touristId}</div>
        </div>
        <div class='text-xs ${a.status==='ack' ? 'text-yellow-300' : 'text-red-300'}'>${a.status.toUpperCase()}</div>
      </div>`;
      item.addEventListener('click', ()=> openProfile(a.touristId, a.id));
      sosListEl.appendChild(item);
    });
  }

  // Modal + mini map for trail
  const modal = document.getElementById('profileModal');
  const closeModal = document.getElementById('closeModal');
  const ackBtn = document.getElementById('ackBtn');
  const resolveBtn = document.getElementById('resolveBtn');
  let currentAlertId = null;

  function getTouristById(id){
    const st = API.getState();
    return (st.tourists || []).find(x=>x.id===id);
  }

  function openProfile(touristId, alertId){
    const t = getTouristById(touristId);
    if (!t) return;
    document.getElementById('p_id').textContent = t.id;
    document.getElementById('p_name').textContent = t.name;
    document.getElementById('p_phone').textContent = t.phone;
    document.getElementById('p_emg').textContent = t.emg;
    currentAlertId = alertId;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(()=>{
      const tm = L.map('trailMap', { zoomControl:false, attributionControl:false });
      tm.setView(t.coord, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(tm);
      const line = L.polyline(t.trail, { color: '#60a5fa' }).addTo(tm);
      L.marker(t.coord, { icon: markerIcon(colorFor(t)) }).addTo(tm);
      tm.fitBounds(line.getBounds().pad(0.3));
    }, 10);
  }

  function close(){
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('trailMap').innerHTML = '';
    currentAlertId = null;
  }

  closeModal.addEventListener('click', close);
  modal.addEventListener('click', (e)=>{ if (e.target === modal) close(); });

  ackBtn.addEventListener('click', async ()=>{
    if (!currentAlertId) return;
    await API.setAlertStatus(currentAlertId,'ack');
  });

  resolveBtn.addEventListener('click', async ()=>{
    if (!currentAlertId) return;
    await API.setAlertStatus(currentAlertId,'resolved');
    close();
  });

  // Search bar
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter') {
        const q = search.value.trim();
        if (!q) return;
        const st = API.getState();
        const t = (st.tourists||[]).find(x=>x.id===q || x.phone===q);
        if (t){
          map.setView(t.coord, 16);
          const m = markers.get(t.id);
          if (m) m.openPopup();
        }
      }
    });
  }

  // Bring in leaflet-pip for point-in-polygon test, then initialize API listeners
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet-pip@1.1.0/leaflet-pip.min.js';
  script.onload = () => {
    // draw restricted polygon from API
    restrictedCoords = API.getRestricted() || [];
    if (restrictedCoords && restrictedCoords.length){
      restrictedPoly = L.polygon(restrictedCoords, { color: '#f59e0b', weight: 2, fillOpacity: 0.08 });
      restrictedPoly.addTo(map);
    }

    // subscribe to updates
    API.onTouristsUpdate((ts)=>{ renderTourists(ts); });
    API.onAlertsUpdate((as)=>{ const st = API.getState(); renderAlertsList(as, st.tourists||[]); });
  };
  document.body.appendChild(script);
})();
