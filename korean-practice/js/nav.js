/**
 * nav.js - ナビゲーション共通処理
 */

/**
 * 現在のページに対応するボトムナビアイテムをアクティブにする
 */
function initBottomNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.bottom-nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // パス末尾でマッチ
    const linkPage = href.split('/').pop();
    const currentPage = currentPath.split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    } else if (linkPage === 'index.html' && (currentPage === '' || currentPage === 'korean-practice')) {
      link.classList.add('active');
    }
  });
}

/**
 * トースト通知を表示
 * @param {string} message - 表示するメッセージ
 * @param {number} duration - 表示時間(ms)
 */
function showToast(message, duration = 2000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/**
 * ローディングオーバーレイを表示/非表示
 * @param {boolean} show
 * @param {HTMLElement} container - ボタンなどのコンテナ
 */
function setLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button.disabled = true;
    button._originalHTML = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
  } else {
    button.disabled = false;
    if (button._originalHTML) {
      button.innerHTML = button._originalHTML;
    }
  }
}

/**
 * 画面を切り替える（SPA用）
 * @param {string} screenId - 表示する画面のID
 */
function showScreen(screenId) {
  // フォーカスを外してから画面を切り替える（aria-hidden警告を防ぐ）
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}

/**
 * スクリーンにアクティブなものを取得
 */
function getActiveScreen() {
  const active = document.querySelector('.screen.active');
  return active ? active.id : null;
}

// DOMContentLoaded時にボトムナビを初期化
document.addEventListener('DOMContentLoaded', initBottomNav);

// グローバルに公開
window.KoreanNav = {
  showScreen,
  getActiveScreen,
  showToast,
  setLoading,
  initBottomNav
};
