// Mock realtime data generator for DEMO mode
// In Firebase mode, you can replace these with Firestore/RTDB listeners
(function(){
  const store = {
    tourists: [], // {id, name, phone, emg, coord: [lat,lng], trail: [[lat,lng],...], status: 'normal'|'restricted'|'sos'}
    alerts: []    // {id, touristId, createdAt, status: 'active'|'ack'|'resolved'}
  };

  const names = ['Aarav','Diya','Kabir','Anaya','Vivaan','Zara','Ishan','Meera'];

  function rand(min, max){ return Math.random()*(max-min)+min; }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  // Initialize with 100 tourists around a city center (e.g., Jaipur)
  const center = [26.9124, 75.7873];
  for (let i=0;i<120;i++){
    const id = 'T'+String(1000+i);
    const name = pick(names)+" "+String.fromCharCode(65+Math.floor(Math.random()*26))+'.';
    const phone = "+91" + Math.floor(6000000000 + Math.random()*3999999999);
    const emg = "+91" + Math.floor(9000000000 + Math.random()*99999999);
    const baseLat = center[0] + rand(-0.15, 0.15);
    const baseLng = center[1] + rand(-0.15, 0.15);
    const trail = Array.from({length:5}, (_,k)=>[baseLat + rand(-0.01,0.01)*k/5, baseLng + rand(-0.01,0.01)*k/5]);
    store.tourists.push({ id, name, phone, emg, coord: [baseLat, baseLng], trail, status: 'normal' });
  }

  // Randomly create some SOS alerts
  function seedAlerts(){
    store.alerts = [];
    for (let i=0;i<5;i++){
      const t = pick(store.tourists);
      t.status = 'sos';
      store.alerts.push({ id: 'S'+(i+1), touristId: t.id, createdAt: Date.now()-i*60000, status: 'active' });
    }
  }
  seedAlerts();

  // Restricted zone polygon (example area)
  const restricted = [
    [26.93,75.75], [26.98,75.77], [26.95,75.84], [26.90,75.82]
  ];

  // Update loop to simulate movement
  setInterval(()=>{
    store.tourists.forEach(t=>{
      const [lat,lng] = t.coord;
      const nlat = lat + rand(-0.001,0.001);
      const nlng = lng + rand(-0.001,0.001);
      t.coord = [nlat, nlng];
      t.trail.push([nlat, nlng]);
      if (t.trail.length>5) t.trail.shift();
    });
  }, 3000);

  window.DEMO_DATA = {
    getTourists: () => store.tourists,
    getAlerts: () => store.alerts,
    setAlertStatus: (alertId, status) => { const a = store.alerts.find(x=>x.id===alertId); if (a) a.status = status; },
    restrictedPolygon: restricted
  };
})();
