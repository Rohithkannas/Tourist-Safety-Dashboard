(function() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear all session-related local storage
      localStorage.removeItem('user');
      localStorage.removeItem('language');
      localStorage.removeItem('demoAuth'); // Also clear the old one just in case
      window.location.href = './index.html';
    });
  }

  // Authentication check for protected pages
  const protectedPages = ['dashboard.html', 'alerts.html', 'analytics.html', 'audit.html', 'geofence.html', 'profile.html', 'settings.html'];
  const currentPage = location.pathname.split('/').pop();

  if (protectedPages.includes(currentPage)) {
    const user = localStorage.getItem('user');
    const language = localStorage.getItem('language');

    if (!user) {
      window.location.replace('./login.html');
      return;
    }

    if (!language) {
      window.location.replace('./language.html');
      return;
    }

    // Populate user info if on dashboard
    if (currentPage === 'dashboard.html') {
        try {
            const userData = JSON.parse(user);
            const languageData = JSON.parse(language);
            const userNameEl = document.getElementById('userName');
            const userLangEl = document.getElementById('userLanguage');
            const userInfoEl = document.getElementById('userInfo');

            if (userNameEl && userLangEl && userInfoEl) {
                userNameEl.textContent = userData.username || 'User';
                userLangEl.textContent = languageData.name || 'English';
                userInfoEl.classList.remove('hidden');
            }
        } catch (e) {
            console.error('Failed to parse user data from localStorage', e);
            // If data is corrupt, clear it and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('language');
            window.location.replace('./login.html');
        }
    }
  }
})();
