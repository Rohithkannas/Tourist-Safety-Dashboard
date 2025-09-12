export function createStore(){
  const store = {
    tourists: [],
    alerts: [],
    restricted: [ [26.93,75.75], [26.98,75.77], [26.95,75.84], [26.90,75.82] ]
  };

  const names = ['Aarav','Diya','Kabir','Anaya','Vivaan','Zara','Ishan','Meera'];
  const center = [26.9124, 75.7873];
  const rand = (min,max)=> Math.random()*(max-min)+min;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

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

  // seed alerts
  for (let i=0;i<5;i++){
    const t = pick(store.tourists);
    t.status = 'sos';
    store.alerts.push({ id: 'S'+(i+1), touristId: t.id, createdAt: Date.now()-i*60000, status: 'active' });
  }

  function tick(){
    store.tourists.forEach(t => {
      const [lat,lng] = t.coord;
      const nlat = lat + rand(-0.001,0.001);
      const nlng = lng + rand(-0.001,0.001);
      t.coord = [nlat, nlng];
      t.trail.push([nlat,nlng]);
      if (t.trail.length>5) t.trail.shift();
    });
  }

  function getTourists(){ return store.tourists; }
  function getAlerts(){ return store.alerts; }
  function getRestricted(){ return store.restricted; }
  function setAlertStatus(id, status){ const a = store.alerts.find(x=>x.id===id); if(!a) return false; a.status = status; return true; }

  return { tick, getTourists, getAlerts, getRestricted, setAlertStatus };
}
