(function () {
  function showScreen(id) {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  }

  function getActiveScreen() {
    const el = document.querySelector('.screen.active');
    return el ? el.id : null;
  }

  let toastTimer = null;
  function showToast(msg, duration) {
    duration = duration || 2200;
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  }

  function initBottomNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bottom-nav a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop();
      if (href === page || (href === 'index.html' && page === '')) {
        a.classList.add('active');
      }
    });
  }

  // オフラインバナー
  function updateOnlineStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    if (navigator.onLine) {
      banner.classList.remove('show');
    } else {
      banner.classList.add('show');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBottomNav();
    updateOnlineStatus();
  });

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Service Worker 登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/korean-android/sw.js', { scope: '/korean-android/' })
        .catch(() => {});
    });
  }

  window.KoreanNav = { showScreen, getActiveScreen, showToast, initBottomNav };
})();
