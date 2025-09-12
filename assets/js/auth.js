// Basic auth utilities for demo and firebase modes
(function(){
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        if (window.firebase && firebase.apps && firebase.apps.length) {
          await firebase.auth().signOut();
        }
      } catch(_) {}
      localStorage.removeItem('demoAuth');
      window.location.href = './index.html';
    });
  }

  // Protect dashboard page
  if (location.pathname.endsWith('dashboard.html')) {
    const authed = !!localStorage.getItem('demoAuth');
    if (!authed) {
      window.location.replace('./login.html');
      return;
    }
    const nameEl = document.getElementById('authorityName');
    if (nameEl) {
      nameEl.textContent = 'Authority';
    }
  }
})();
