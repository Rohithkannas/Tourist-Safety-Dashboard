(function(){
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { if (window.firebase && firebase.apps && firebase.apps.length) { await firebase.auth().signOut(); } } catch(_) {}
      localStorage.removeItem('demoAuth');
      window.location.href = './index.html';
    });
  }
  if (location.pathname.endsWith('dashboard.html')) {
    const authed = !!localStorage.getItem('demoAuth');
    if (!authed) { window.location.replace('./login.html'); return; }
    const nameEl = document.getElementById('authorityName');
    if (nameEl) {
      const role = localStorage.getItem('role') || 'Authority';
      nameEl.textContent = role;
    }
  }
})();
