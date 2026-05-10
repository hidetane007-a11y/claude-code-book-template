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

  // オフラインバナー（navigator.onLine は誤検知が多いため fetch で実確認）
  async function updateOnlineStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;

    if (navigator.onLine) {
      // onLine=true でも稀に誤りがあるが、その場合はバナーを出さない
      banner.classList.remove('show');
      return;
    }

    // onLine=false のときだけ fetch で再確認（false-negative 対策）
    try {
      await fetch(location.href, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(4000)
      });
      banner.classList.remove('show'); // 実際は繋がっている
    } catch {
      banner.classList.add('show');    // 本当にオフライン
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBottomNav();
    updateOnlineStatus();
  });

  window.addEventListener('online',  () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.remove('show');
  });
  window.addEventListener('offline', () => {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.add('show');
  });

  // Service Worker 登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/korean-android/sw.js', { scope: '/korean-android/' })
        .catch(() => {});
    });
  }

  window.KoreanNav = { showScreen, getActiveScreen, showToast, initBottomNav };
})();
