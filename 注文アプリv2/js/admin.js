let currentFilter = 'all';
let selectedOrderId = null;
let lastOrderCount = -1;
let cachedOrders = [];

// ── 通知音 ────────────────────────────────────────────────────────

function playOrderSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[0, 880], [0.18, 1108], [0.36, 1318]].forEach(([delay, freq]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.55);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch (e) {}
}

function flashNewOrder() {
  const bar = document.getElementById('stats-bar');
  bar.classList.add('new-order-flash');
  setTimeout(() => bar.classList.remove('new-order-flash'), 1500);
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

// ── Demo data ─────────────────────────────────────────────────────

async function addDemoOrders() {
  const names    = ['たなか たろう', 'すずき はなこ', 'さとう じろう', 'やまだ みさき'];
  const phones   = ['090-1111-2222', '080-3333-4444', '070-5555-6666', '090-7777-8888'];
  const statuses = ['pending', 'preparing', 'ready', 'delivered'];
  const tables   = [1, 3, 5, 2];

  for (let i = 0; i < names.length; i++) {
    const items = [MENU[i % MENU.length], MENU[(i + 2) % MENU.length]];
    const orderItems = items.map(m => ({ id: m.id, name: m.name, price: m.price, qty: 1 + (i % 2) }));
    const order = await addOrder({
      type: 'instore',
      tableNumber: tables[i],
      customer: { name: names[i], phone: phones[i] },
      isReservation: false,
      scheduledDate: '',
      scheduledTime: '',
      items: orderItems,
      total: orderItems.reduce((s, c) => s + c.price * c.qty, 0),
    });
    if (order.status !== statuses[i]) await updateOrderStatus(order.id, statuses[i]);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await addOrder({
    type: 'takeout',
    tableNumber: null,
    customer: { name: 'ささき よしこ', phone: '080-0001-0001' },
    isReservation: true,
    scheduledDate: tomorrow.toISOString().slice(0, 10),
    scheduledTime: '18:00',
    items: [
      { id: MENU[0].id, name: MENU[0].name, price: MENU[0].price, qty: 2 },
      { id: MENU[5].id, name: MENU[5].name, price: MENU[5].price, qty: 1 },
    ],
    total: MENU[0].price * 2 + MENU[5].price,
  });

  await refreshOrders(false);
}

// ── Init ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  renderFilters();
  await refreshOrders(false);

  document.getElementById('demo-btn').addEventListener('click', addDemoOrders);
  document.getElementById('clear-btn').addEventListener('click', async () => {
    if (!confirm('全注文データを削除しますか？')) return;
    if (_sb) {
      await _sb.from('orders').delete().neq('id', '');
    } else {
      localStorage.removeItem('orders');
    }
    lastOrderCount = 0;
    selectedOrderId = null;
    await refreshOrders(false);
  });

  if (_sb) {
    _sb.channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        () => refreshOrders(true))
      .subscribe();
  } else {
    window.addEventListener('storage', e => {
      if (e.key === 'orders') refreshOrders(true);
    });
    setInterval(() => refreshOrders(true), 3000);
  }
});
