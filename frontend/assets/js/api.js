(function(){
  const state = { mode:'demo', base:'http://localhost:4000', tourists:[], alerts:[], restricted:[], listeners:{tourists:[], alerts:[]}, socket:null };
  async function detectBackend(){ try{ const r = await fetch(state.base+'/health',{cache:'no-store'}); return r.ok; }catch(_){ return false; } }
  function notify(type,payload){ state.listeners[type].forEach(cb=>{ try{cb(payload);}catch(e){console.error(e);} }); }
  function onTouristsUpdate(cb){ state.listeners.tourists.push(cb); }
  function onAlertsUpdate(cb){ state.listeners.alerts.push(cb); }
  async function init(){
    const has = await detectBackend();
    if (has){
      state.mode='backend';
      const [t,a,r] = await Promise.all([
        fetch(state.base+'/api/tourists'),
        fetch(state.base+'/api/alerts'),
        fetch(state.base+'/api/restricted')
      ]);
      state.tourists = await t.json();
      state.alerts = await a.json();
      const rr = await r.json(); state.restricted = rr.polygon||[];
      notify('tourists', state.tourists); notify('alerts', state.alerts);
      const token = localStorage.getItem('apiToken') || 'dev-key';
      state.socket = io(state.base,{transports:['websocket'], auth: { token }});
      state.socket.on('tourists:update',d=>{ state.tourists=d; notify('tourists',d); });
      state.socket.on('alerts:update',d=>{ state.alerts=d; notify('alerts',d); });
    } else {
      state.mode='demo';
      state.tourists = DEMO_DATA.getTourists(); state.alerts = DEMO_DATA.getAlerts(); state.restricted = DEMO_DATA.restrictedPolygon;
      notify('tourists', state.tourists); notify('alerts', state.alerts);
      setInterval(()=>{ state.tourists = DEMO_DATA.getTourists(); state.alerts = DEMO_DATA.getAlerts(); notify('tourists', state.tourists); notify('alerts', state.alerts); }, 3500);
    }
  }
  async function setAlertStatus(id,status){
    if (state.mode==='backend'){
      const url = state.base + (status==='ack'?`/api/alerts/${id}/ack`:`/api/alerts/${id}/resolve`);
      const token = localStorage.getItem('apiToken') || 'dev-key';
      const res = await fetch(url,{method:'POST', headers:{ 'Authorization': `Bearer ${token}` }}); if(!res.ok) throw new Error('Update failed');
      const aRes = await fetch(state.base+'/api/alerts'); state.alerts = await aRes.json(); notify('alerts', state.alerts);
    } else { DEMO_DATA.setAlertStatus(id,status); state.alerts = DEMO_DATA.getAlerts(); notify('alerts', state.alerts); }
  }
  function getState(){ return state; }
  function getRestricted(){ return state.restricted; }
  window.API = { init, onTouristsUpdate, onAlertsUpdate, setAlertStatus, getState, getRestricted };
  if (location.pathname.endsWith('dashboard.html')) { init(); }
})();
