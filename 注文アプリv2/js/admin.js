let currentFilter = 'all';
let selectedOrderId = null;
let lastOrderCount = -1;
let cachedOrders = [];
let realtimeChannel = null;

// ── AudioContext（グローバル・モバイル対応）────────────────────────
let _audioCtx = null;

function _ensureAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// 最初のタップ/クリックで AudioContext をアンロック（iOS/Android 必須）
['touchstart', 'click'].forEach(type => {
  document.addEventListener(type, function unlock() {
    _ensureAudioCtx().resume();
    document.removeEventListener(type, unlock);
  }, { once: true });
});

// ── 通知音 ────────────────────────────────────────────────────────

function playOrderSound() {
  try {
    const ctx = _ensureAudioCtx();
    ctx.resume().then(() => {
      function playNote(freq, start, dur, vol) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.03);
        gain.gain.setValueAtTime(vol, ctx.currentTime + start + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      }
      // 運命モチーフ第1句：ソソソ ミ♭（G4=392, Eb4=311）
      playNote(392, 0.00, 0.18, 0.6);
      playNote(392, 0.20, 0.18, 0.6);
      playNote(392, 0.40, 0.18, 0.6);
      playNote(311, 0.60, 0.65, 0.7);
      // 第2句：ファファファ レ（F4=349, D4=294）
      playNote(349, 1.45, 0.18, 0.6);
      playNote(349, 1.65, 0.18, 0.6);
      playNote(349, 1.85, 0.18, 0.6);
      playNote(294, 2.05, 0.70, 0.7);
      // 第3句：ミ♭ミ♭ミ♭ ド（Eb4=311, C4=261）
      playNote(311, 3.10, 0.18, 0.6);
      playNote(311, 3.30, 0.18, 0.6);
      playNote(311, 3.50, 0.18, 0.6);
      playNote(261, 3.70, 1.10, 0.7);
    });
  } catch (e) {}
}

// ── フラッシュ（CSS animation 廃止・JS 直接操作）─────────────────

function flashNewOrder() {
  const overlay = document.getElementById('fate-flash-overlay');
  if (overlay._flashTimer) clearInterval(overlay._flashTimer);
  let step = 0;
  const colors = ['rgba(220,38,38,0.85)', 'rgba(255,255,255,0.85)'];
  overlay._flashTimer = setInterval(() => {
    step++;
    if (step % 2 === 1) {
      overlay.style.backgroundColor = colors[Math.floor((step - 1) / 2) % 2];
      overlay.style.display = 'block';
    } else {
      overlay.style.display = 'none';
    }
    if (step >= 20) {
      clearInterval(overlay._flashTimer);
      overlay._flashTimer = null;
      overlay.style.backgroundColor = 'rgba(220,38,38,0.3)';
      overlay.style.display = 'block';
    }
  }, 250);
}

// ── Stats ─────────────────────────────────────────────────────────

function renderStats() {
  const counts = { pending: 0, preparing: 0, ready: 0, delivered: 0 };
  let reservationCount = 0;
  cachedOrders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
    if (o.isReservation) reservationCount++;
  });
  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-card"><strong>${cachedOrders.length}</strong>総注文数</div>
    <div class="stat-card"><strong>${reservationCount}</strong>予約</div>
    <div class="stat-card"><strong>${counts.pending}</strong>受付済</div>
    <div class="stat-card"><strong>${counts.preparing}</strong>調理中</div>
    <div class="stat-card"><strong>${counts.ready}</strong>準備完了</div>
  `;
}

// ── Filters ───────────────────────────────────────────────────────

function renderFilters() {
  const counts = {
    all:         cachedOrders.length,
    reservation: cachedOrders.filter(o => o.isReservation).length,
    pending:     cachedOrders.filter(o => o.status === 'pending').length,
    preparing:   cachedOrders.filter(o => o.status === 'preparing').length,
    ready:       cachedOrders.filter(o => o.status === 'ready').length,
    delivered:   cachedOrders.filter(o => o.status === 'delivered').length,
  };
  const defs = [
    { key: 'all',         label: '全件' },
    { key: 'reservation', label: '📅 予約' },
    { key: 'pending',     label: '受付済' },
    { key: 'preparing',   label: '調理中' },
    { key: 'ready',       label: '準備完了' },
    { key: 'delivered',   label: '完了' },
  ];
  document.getElementById('filters').innerHTML = defs.map(f => `
    <button class="filter-btn ${f.key === currentFilter ? 'active' : ''}" onclick="setFilter('${f.key}')">
      ${f.label}
      <span class="filter-count">${counts[f.key]}</span>
    </button>
  `).join('');
}

function setFilter(key) {
  currentFilter = key;
  selectedOrderId = null;
  renderFilters();
  renderOrderGrid();
  renderDetailPanel();
}

// ── Order Grid ────────────────────────────────────────────────────

function renderOrderGrid() {
  const all = cachedOrders;
  const orders = currentFilter === 'all' ? all
    : currentFilter === 'reservation' ? all.filter(o => o.isReservation)
    : all.filter(o => o.status === currentFilter);
  const grid = document.getElementById('order-grid');

  if (orders.length === 0) {
    grid.innerHTML = '<p class="empty-msg">注文がありません</p>';
    return;
  }

  grid.innerHTML = orders.map(order => {
    const s = STATUS_LABELS[order.status];
    const dt = new Date(order.createdAt);
    const dateStr = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const itemsSummary = order.items.map(i => `${i.name}×${i.qty}`).join('  ');

    const tableBadge = (!order.isReservation && order.tableNumber)
      ? `<span class="table-badge">T${order.tableNumber}</span>` : '';
    const resBadge = order.isReservation
      ? `<span class="reservation-badge">📅 予約</span>` : '';

    const actionBtn = s.next
      ? `<button class="status-advance-btn" style="background:${s.color}"
             onclick="advanceStatus('${order.id}','${s.next}',event)">${s.text} →</button>`
      : `<span class="status-done-badge" style="background:${s.color}">${s.text}</span>`;

    return `
      <div class="order-card ${order.isReservation ? 'reservation-card' : ''} ${selectedOrderId === order.id ? 'selected' : ''}"
           onclick="selectOrder('${order.id}')">
        <div class="order-card-header">
          <span class="order-id-badge">${order.id}</span>
          <span class="order-datetime">${dateStr}</span>
        </div>
        <div class="order-card-customer">
          ${order.customer.name}
          ${tableBadge}${resBadge}
        </div>
        <div class="order-card-items">${itemsSummary}</div>
        <div class="order-card-footer">
          <span class="order-total">¥${order.total.toLocaleString()}</span>
          ${actionBtn}
        </div>
      </div>`;
  }).join('');
}

// ── Detail Panel ──────────────────────────────────────────────────

function selectOrder(id) {
  selectedOrderId = id;
  const overlay = document.getElementById('fate-flash-overlay');
  if (overlay._flashTimer) { clearInterval(overlay._flashTimer); overlay._flashTimer = null; }
  overlay.style.display = 'none';
  renderOrderGrid();
  renderDetailPanel();
}

function renderDetailPanel() {
  const panel = document.getElementById('detail-panel');
  const order = selectedOrderId ? cachedOrders.find(o => o.id === selectedOrderId) : null;

  if (!order) {
    panel.innerHTML = `
      <div class="detail-empty">
        <div class="detail-empty-icon">📋</div>
        <p>注文を選択してください</p>
      </div>`;
    return;
  }

  const s = STATUS_LABELS[order.status];
  const tableBadge = (!order.isReservation && order.tableNumber)
    ? `<span class="table-badge">テーブル ${order.tableNumber}</span>` : '';
  const resBadge = order.isReservation
    ? `<span class="reservation-badge">📅 予約</span>` : '';

  let resTimeHtml = '';
  if (order.isReservation && order.scheduledDate) {
    const rd = new Date(order.scheduledDate + 'T00:00:00');
    resTimeHtml = `<div class="detail-reservation-time">
      ${rd.getMonth()+1}/${rd.getDate()} ${order.scheduledTime}
    </div>`;
  }

  const advanceBtn = s.next
    ? `<button class="detail-advance-btn" style="background:${s.color}"
           onclick="advanceStatus('${order.id}','${s.next}',event)">
         → ${STATUS_LABELS[s.next].text}へ
       </button>` : '';

  const tableGrid = !order.isReservation
    ? `<div class="detail-table-section">
         <div class="detail-table-label">テーブル番号</div>
         <div class="detail-table-grid">
           ${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `
             <button class="detail-table-btn ${order.tableNumber === n ? 'selected' : ''}"
                     onclick="assignTable('${order.id}', ${n}, event)">${n}</button>
           `).join('')}
         </div>
       </div>` : '';

  panel.innerHTML = `
    <div class="detail-content">
      <div class="detail-order-id">${order.id}</div>
      <div>
        <div class="detail-customer">${order.customer.name}</div>
        <div class="detail-phone">${order.customer.phone}</div>
      </div>
      <div class="detail-meta">
        ${tableBadge}${resBadge}${resTimeHtml}
      </div>
      ${tableGrid}
      <div class="detail-items">
        ${order.items.map(i => `
          <div class="detail-item">
            <span class="detail-item-name">${i.name} × ${i.qty}</span>
            <span class="detail-item-price">¥${(i.price * i.qty).toLocaleString()}</span>
          </div>`).join('')}
      </div>
      <div class="detail-total">合計 <span>¥${order.total.toLocaleString()}</span></div>
      <div class="detail-actions">
        <button class="detail-print-btn" onclick="printOrder('${order.id}')">🖨️ 伝票印刷</button>
        ${advanceBtn}
      </div>
    </div>`;
}

// ── Print ─────────────────────────────────────────────────────────

function printOrder(id) {
  const order = cachedOrders.find(o => o.id === id);
  if (!order) return;
  const dt = new Date(order.createdAt);
  const dateStr = `${dt.getFullYear()}/${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;

  document.getElementById('print-area').innerHTML = `
    <h1>伝票</h1>
    <div class="print-row"><span>注文ID</span><span>${order.id}</span></div>
    <div class="print-row"><span>日時</span><span>${dateStr}</span></div>
    <div class="print-row"><span>お名前</span><span>${order.customer.name}</span></div>
    <div class="print-row"><span>電話番号</span><span>${order.customer.phone}</span></div>
    ${order.tableNumber ? `<div class="print-row"><span>テーブル</span><span>${order.tableNumber}</span></div>` : ''}
    ${order.isReservation && order.scheduledDate
      ? `<div class="print-row"><span>予約日時</span><span>${order.scheduledDate} ${order.scheduledTime}</span></div>` : ''}
    <hr style="margin:12px 0">
    ${order.items.map(i => `
      <div class="print-row">
        <span>${i.name} × ${i.qty}</span>
        <span>¥${(i.price * i.qty).toLocaleString()}</span>
      </div>`).join('')}
    <div class="print-total">合計 ¥${order.total.toLocaleString()}</div>
  `;
  window.print();
}

// ── Table assignment ──────────────────────────────────────────────

async function assignTable(id, tableNumber, event) {
  if (event) event.stopPropagation();
  const order = cachedOrders.find(o => o.id === id);
  if (!order) return;
  const next = order.tableNumber === tableNumber ? null : tableNumber;
  await updateOrderTable(id, next);
  await refreshOrders(false);
}

// ── Status advance ────────────────────────────────────────────────

async function advanceStatus(id, nextStatus, event) {
  if (event) event.stopPropagation();
  await updateOrderStatus(id, nextStatus);
  await refreshOrders(false);
}

// ── Data refresh ──────────────────────────────────────────────────

async function refreshOrders(withSound) {
  cachedOrders = await getOrders();
  if (withSound && lastOrderCount >= 0 && cachedOrders.length > lastOrderCount) {
    playOrderSound();
    flashNewOrder();
  }
  lastOrderCount = cachedOrders.length;
  renderStats();
  renderFilters();
  renderOrderGrid();
  renderDetailPanel();
}

// ── Init ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  renderFilters();
  await refreshOrders(false);

  document.getElementById('clear-btn').addEventListener('click', async () => {
    if (!confirm('全注文データを削除しますか？')) return;
    await deleteAllOrders();
    lastOrderCount = 0;
    selectedOrderId = null;
    await refreshOrders(false);
  });

  if (_sb) {
    function setRealtimeStatus(status) {
      const el = document.getElementById('realtime-status');
      if (!el) return;
      if (status === 'SUBSCRIBED') {
        el.textContent = '🟢 リアルタイム接続中';
        el.style.color = '#10b981';
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        el.textContent = '🔴 切断中（ポーリングで更新）';
        el.style.color = '#ef4444';
      } else {
        el.textContent = '🟡 接続中…';
        el.style.color = '#f59e0b';
      }
    }

    function subscribeRealtime() {
      if (realtimeChannel) _sb.removeChannel(realtimeChannel);
      realtimeChannel = _sb.channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
          () => refreshOrders(true))
        .subscribe(status => {
          setRealtimeStatus(status);
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setTimeout(subscribeRealtime, 3000);
          }
        });
    }
    subscribeRealtime();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshOrders(true);
        subscribeRealtime();
      }
    });

    setInterval(() => refreshOrders(false), 5000);
  } else {
    window.addEventListener('storage', e => {
      if (e.key === 'orders') refreshOrders(true);
    });
    setInterval(() => refreshOrders(true), 3000);
  }
});
