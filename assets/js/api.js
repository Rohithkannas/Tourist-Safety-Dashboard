// API layer: prefers local backend (http://localhost:4000) with Socket.IO, falls back to DEMO_DATA
(function(){
  const state = {
    mode: 'demo', // 'backend' | 'demo'
    base: 'http://localhost:4000',
    tourists: [],
    alerts: [],
    restricted: [],
    listeners: { tourists: [], alerts: [] },
    socket: null
  };

  async function detectBackend(){
    try {
      const res = await fetch(state.base + '/health', { cache: 'no-store' });
      const ok = res.ok; if (ok) return true;
    } catch(_) {}
    return false;
  }

  function notify(type, payload){
    state.listeners[type].forEach(cb=>{ try{ cb(payload); }catch(e){ console.error(e); } });
  }

  function onTouristsUpdate(cb){ state.listeners.tourists.push(cb); }
  function onAlertsUpdate(cb){ state.listeners.alerts.push(cb); }

  async function init(){
    const hasBackend = await detectBackend();
    if (hasBackend){
      state.mode = 'backend';
      // initial fetch
      const [tRes,aRes,rRes] = await Promise.all([
        fetch(state.base + '/api/tourists'),
        fetch(state.base + '/api/alerts'),
        fetch(state.base + '/api/restricted')
      ]);
      state.tourists = await tRes.json();
      state.alerts = await aRes.json();
      const r = await rRes.json();
      state.restricted = r.polygon || [];
      notify('tourists', state.tourists);
      notify('alerts', state.alerts);
      // socket
      state.socket = io(state.base, { transports: ['websocket'] });
      state.socket.on('tourists:update', (data)=>{ state.tourists = data; notify('tourists', data); });
      state.socket.on('alerts:update', (data)=>{ state.alerts = data; notify('alerts', data); });
    } else {
      state.mode = 'demo';
      state.tourists = (window.DEMO_DATA && DEMO_DATA.getTourists()) || [];
      state.alerts = (window.DEMO_DATA && DEMO_DATA.getAlerts()) || [];
      state.restricted = (window.DEMO_DATA && DEMO_DATA.restrictedPolygon) || [];
      notify('tourists', state.tourists);
      notify('alerts', state.alerts);
      // poll demo updates
      setInterval(()=>{
        state.tourists = DEMO_DATA.getTourists();
        state.alerts = DEMO_DATA.getAlerts();
        notify('tourists', state.tourists);
        notify('alerts', state.alerts);
      }, 3500);
    }
  }

  async function setAlertStatus(id, status){
    if (state.mode === 'backend'){
      const url = state.base + (status==='ack' ? `/api/alerts/${id}/ack` : `/api/alerts/${id}/resolve`);
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to update alert');
      // server will broadcast via socket; also refetch alerts to ensure sync
      const aRes = await fetch(state.base + '/api/alerts');
      state.alerts = await aRes.json();
      notify('alerts', state.alerts);
    } else {
      DEMO_DATA.setAlertStatus(id, status);
      state.alerts = DEMO_DATA.getAlerts();
      notify('alerts', state.alerts);
    }
  }

  function getState(){ return state; }
  function getRestricted(){ return state.restricted; }

  window.API = { init, onTouristsUpdate, onAlertsUpdate, setAlertStatus, getState, getRestricted };
  // auto-init on dashboard page
  if (location.pathname.endsWith('dashboard.html')) { init(); }
})();
