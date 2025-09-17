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
  const exportCsvBtn = document.getElementById('exportCsv');
  const exportJsonBtn = document.getElementById('exportJson');
  let currentAlertId = null;
  let currentTouristId = null;

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
    await API.setAlertStatus(currentAlertId,'resolved', { type: document.getElementById('incidentType').value, notes: document.getElementById('incidentNotes').value || '' });
    addAudit('Resolved', `Type=${document.getElementById('incidentType').value}${document.getElementById('incidentNotes').value?`, Notes=${document.getElementById('incidentNotes').value}`:''}`);
    close();
  });

  // Simple audit trail store in-memory by alertId
  const audits = new Map(); // alertId -> [{ts, user, action, meta}]

  async function currentUser(){
    try { const r = await fetch('http://localhost:4000/auth/me', { credentials: 'include' }); const j = await r.json(); return j.user?.email || 'unknown@local'; } catch { return 'unknown@local'; }
  }

  // Role-based gating
  function roleAllows(action){
    const role = window.__role || 'dispatcher';
    const matrix = {
      // actions: ack, resolve, assign, efir, comms, export
      'super-admin': { ack: true, resolve: true, assign: true, efir: true, comms: true, export: true },
      'state-admin': { ack: true, resolve: true, assign: true, efir: true, comms: true, export: true },
      'dispatcher':  { ack: true, resolve: true, assign: true, efir: true, comms: true, export: true },
      'officer':     { ack: true, resolve: false, assign: false, efir: false, comms: true, export: false },
    };
    return (matrix[role] || matrix['dispatcher'])[action];
  }

  function applyRoleGate(){
    if (!ackBtn || !resolveBtn) return;
    if (!roleAllows('resolve')) resolveBtn.style.display = 'none';
    if (exportCsvBtn) exportCsvBtn.style.display = roleAllows('export') ? '' : 'none';
    if (exportJsonBtn) exportJsonBtn.style.display = roleAllows('export') ? '' : 'none';
  }

  // Apply gate shortly after auth loads role
  setTimeout(applyRoleGate, 500);

  function addAudit(action, meta){
    if (!currentAlertId) return;
    const list = audits.get(currentAlertId) || [];
    list.push({ ts: Date.now(), user: window.__me || 'unknown@local', action, meta });
    audits.set(currentAlertId, list);
    renderAudit();
  }

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

  // Export helpers
  function toCsv(rows){
    const esc = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    return rows.map(r=>r.map(esc).join(',')).join('\n');
  }
  function download(filename, text, mime='text/plain'){
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', ()=>{
    if (!roleAllows('export')) return;
    const st = API.getState();
    const tMap = new Map((st.tourists||[]).map(t=>[t.id, t]));
    const rows = [[ 'AlertID','TouristID','Name','Phone','Status','CreatedAt','Lat','Lng' ]];
    const alerts = st.alerts || [];
    alerts.forEach(a=>{
      const t = tMap.get(a.touristId) || {};
      const lat = (t.coord||[])[0]; const lng = (t.coord||[])[1];
      rows.push([a.id, a.touristId, t.name||'', t.phone||'', a.status, new Date(a.createdAt).toISOString(), lat, lng]);
    });
    download(`alerts_${Date.now()}.csv`, toCsv(rows), 'text/csv');
  });
  if (exportJsonBtn) exportJsonBtn.addEventListener('click', ()=>{
    if (!roleAllows('export')) return;
    const st = API.getState();
    download(`export_${Date.now()}.json`, JSON.stringify({ tourists: st.tourists||[], alerts: st.alerts||[] }, null, 2), 'application/json');
  });

  const stateSelector = document.getElementById('stateSelector');
  const heatToggle = document.getElementById('heatToggle');
  const analyticsToggle = document.getElementById('analyticsToggle');
  const analyticsPanel = document.getElementById('analyticsPanel');
  let alertsChart = null;
  let batteryChart = null;
  if (stateSelector) {
    stateSelector.addEventListener('change', ()=>{
      activeState = stateSelector.value;
      clearMarkersOutsideState();
      const st = API.getState();
      renderTourists(st.tourists||[]);
      toggleHeatmap(st.tourists||[]);
      // Adjust map view for demo
      const centers = { meghalaya:[25.5788,91.8933], rajasthan:[26.9124,75.7873], maharashtra:[19.0760,72.8777], all:[22.5,78.96] };
      const zooms = { meghalaya:12, rajasthan:12, maharashtra:11, all:5 };
      map.setView(centers[activeState]||centers.all, zooms[activeState]||5);
      renderAnalytics();
    });
  }
  if (heatToggle) {
    heatToggle.addEventListener('click', ()=>{
      heatOn = !heatOn;
      heatToggle.textContent = `Heatmap: ${heatOn ? 'On' : 'Off'}`;
      const st = API.getState();
      toggleHeatmap(st.tourists||[]);
    });
  }
  if (analyticsToggle && analyticsPanel) {
    analyticsToggle.addEventListener('click', ()=>{
      const open = !analyticsPanel.classList.contains('hidden');
      if (open) {
        analyticsPanel.classList.add('hidden');
        analyticsToggle.textContent = 'Analytics';
      } else {
        analyticsPanel.classList.remove('hidden');
        analyticsToggle.textContent = 'Analytics ▲';
        renderAnalytics();
      }
    });
  }

  function renderAnalytics(){
    if (!analyticsPanel || analyticsPanel.classList.contains('hidden')) return;
    const st = API.getState();
    const tourists = (st.tourists||[]).filter(t=>inState(t.coord));
    const alerts = (st.alerts||[]).filter(a=>{
      const t = tourists.find(x=>x.id===a.touristId);
      return !!t;
    });

    // Alerts by status
    const statusCounts = alerts.reduce((acc,a)=>{ acc[a.status] = (acc[a.status]||0)+1; return acc; }, {});
    const statuses = ['active','ack','resolved'];
    const data1 = statuses.map(s=>statusCounts[s]||0);
    if (!alertsChart) {
      const ctx = document.getElementById('alertsChart').getContext('2d');
      alertsChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Active','Acknowledged','Resolved'], datasets: [{ data: data1, backgroundColor: ['#ef4444','#f59e0b','#10b981'] }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#e5e7eb' } } } }
      });
    } else {
      alertsChart.data.datasets[0].data = data1; alertsChart.update();
    }

    // Battery distribution
    const buckets = { '0-20':0, '21-40':0, '41-60':0, '61-80':0, '81-100':0 };
    tourists.forEach(t=>{
      const b = (t.device&&t.device.battery) || 0;
      if (b<=20) buckets['0-20']++; else if (b<=40) buckets['21-40']++; else if (b<=60) buckets['41-60']++; else if (b<=80) buckets['61-80']++; else buckets['81-100']++;
    });
    const labels2 = Object.keys(buckets);
    const data2 = labels2.map(k=>buckets[k]);
    if (!batteryChart) {
      const ctx2 = document.getElementById('batteryChart').getContext('2d');
      batteryChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: labels2, datasets: [{ label: 'Units', data: data2, backgroundColor: '#60a5fa' }] },
        options: { scales: { x: { ticks: { color: '#e5e7eb' } }, y: { ticks: { color: '#e5e7eb' } } }, plugins: { legend: { labels: { color: '#e5e7eb' } } } }
      });
    } else {
      batteryChart.data.labels = labels2; batteryChart.data.datasets[0].data = data2; batteryChart.update();
    }
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
    API.onTouristsUpdate((ts)=>{ renderTourists(ts); toggleHeatmap(ts); renderAnalytics(); });
    API.onAlertsUpdate((as)=>{ const st = API.getState(); renderAlertsList(as, st.tourists||[]); renderAnalytics(); });
  };
  document.body.appendChild(script);
})();
