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

  function showOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.add('show');
  }
  function hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.remove('show');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBottomNav();
  });

  window.addEventListener('online',  hideOfflineBanner);
  window.addEventListener('offline', showOfflineBanner);

  // Capacitorネイティブではファイルをバンドル管理するためSW不要
  const _isNative = !!(
    window.Capacitor &&
    window.Capacitor.isNativePlatform &&
    window.Capacitor.isNativePlatform()
  );
  if (!_isNative && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl   = new URL('sw.js',  location.href).href;
      const swScope = new URL('./',     location.href).href;
      navigator.serviceWorker.register(swUrl, { scope: swScope }).catch(() => {});
    });
  }

  window.KoreanNav = { showScreen, getActiveScreen, showToast, initBottomNav };
})();
