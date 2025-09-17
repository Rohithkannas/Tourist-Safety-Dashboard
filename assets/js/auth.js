// Auth utilities using backend session
(function(){
  const API_BASE = 'http://localhost:4000';

  async function csrf() {
    const res = await fetch(API_BASE + '/csrf-token', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error('Failed CSRF');
    const j = await res.json();
    return j.csrfToken;
  }

  async function me() {
    const res = await fetch(API_BASE + '/auth/me', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return { user: null };
    return res.json();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const token = await csrf();
        await fetch(API_BASE + '/auth/logout', { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': token } });
      } catch(_) {}
      window.location.href = './index.html';
    });
  }

  // Protect dashboard page
  if (location.pathname.endsWith('dashboard.html')) {
    (async () => {
      try {
        const { user } = await me();
        if (!user) {
          window.location.replace('./login.html');
          return;
        }
        const nameEl = document.getElementById('authorityName');
        if (nameEl) nameEl.textContent = `${user.email} • ${user.role}`;
        // Expose globally for other modules
        window.__me = user.email;
        window.__role = user.role;
      } catch(_) {
        window.location.replace('./login.html');
      }
    })();
  }
})();
