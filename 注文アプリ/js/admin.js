let currentFilter = 'all';

function renderStats(orders) {
  const counts = { pending: 0, preparing: 0, ready: 0, delivered: 0 };
  let reservationCount = 0;
  orders.forEach(o => {
    counts[o.status] = (counts[o.status] || 0) + 1;
    if (o.isReservation) reservationCount++;
  });
  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-card"><strong>${orders.length}</strong>総注文数</div>
    <div class="stat-card"><strong>${reservationCount}</strong>予約</div>
    <div class="stat-card"><strong>${counts.pending}</strong>受付済</div>
    <div class="stat-card"><strong>${counts.preparing}</strong>調理中</div>
    <div class="stat-card"><strong>${counts.ready}</strong>準備完了</div>
  `;
}

function renderFilters() {
  const defs = [
    { key: 'all', label: '全件' },
    { key: 'reservation', label: '📅 予約' },
    { key: 'pending', label: '受付済' },
    { key: 'preparing', label: '調理中' },
    { key: 'ready', label: '準備完了' },
    { key: 'delivered', label: '完了' },
  ];
  document.getElementById('filters').innerHTML = defs.map(f => `
    <button class="filter-btn ${f.key === currentFilter ? 'active' : ''}" onclick="setFilter('${f.key}')">${f.label}</button>
  `).join('');
}

function setFilter(key) {
  currentFilter = key;
  renderFilters();
  renderTable();
}

function renderTable() {
  const all = getOrders();
  const orders = currentFilter === 'all' ? all
    : currentFilter === 'reservation' ? all.filter(o => o.isReservation)
    : all.filter(o => o.status === currentFilter);
  const tbody = document.getElementById('order-tbody');

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">注文がありません</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const s = STATUS_LABELS[order.status];
    const dt = new Date(order.createdAt);
    const dateStr = `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const itemsSummary = order.items.map(i => `${i.name}×${i.qty}`).join('、');
    const nextClick = s.next
      ? `onclick="advanceStatus('${order.id}', '${s.next}')"`
      : '';
    const typeTag = order.type === 'instore'
      ? '<span class="type-tag instore">店内</span>'
      : order.type === 'takeout'
        ? '<span class="type-tag takeout">受取</span>'
        : '<span class="type-tag delivery">配達</span>';
    const reserveTag = order.isReservation ? ' <span class="type-tag reservation">📅予約</span>' : '';

    let scheduledStr = '';
    if (order.isReservation && order.scheduledDate) {
      const rd = new Date(order.scheduledDate + 'T00:00:00');
      scheduledStr = `<br><small class="reservation-datetime">${rd.getMonth()+1}/${rd.getDate()} ${order.scheduledTime}</small>`;
    } else if (order.scheduledTime) {
      scheduledStr = `<br><small>${order.scheduledTime}</small>`;
    }

    return `
      <tr${order.isReservation ? ' class="reservation-row"' : ''}>
        <td>${order.id}<br><small style="color:var(--text-muted)">${dateStr}</small></td>
        <td>${order.customer.name}<br><small style="color:var(--text-muted)">${order.customer.phone}</small></td>
        <td>${typeTag}${reserveTag}${scheduledStr}</td>
        <td><div>${itemsSummary}</div></td>
        <td style="text-align:right;font-weight:700">¥${order.total.toLocaleString()}</td>
        <td>
          <button class="status-badge ${order.status}" style="background:${s.color}" ${nextClick} title="${s.next ? '次のステータスへ' : ''}">
            ${s.text}${s.next ? ' →' : ''}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function advanceStatus(id, nextStatus) {
  updateOrderStatus(id, nextStatus);
  renderStats(getOrders());
  renderTable();
}

function addDemoOrders() {
  const names = ['田中太郎', '鈴木花子', '佐藤次郎', '山田美咲'];
  const phones = ['090-1111-2222', '080-3333-4444', '070-5555-6666', '090-7777-8888'];
  const addresses = ['東京都渋谷区1-1-1', '大阪府梅田2-2-2', '名古屋市栄3-3-3', ''];
  const statuses = ['pending', 'preparing', 'ready', 'delivered'];
  const times = ['12:00', '12:30', '13:00', '11:30'];

  names.forEach((name, i) => {
    const items = [MENU[i % MENU.length], MENU[(i + 2) % MENU.length]];
    const orderItems = items.map(m => ({ id: m.id, name: m.name, price: m.price, qty: 1 + (i % 2) }));
    const total = orderItems.reduce((s, c) => s + c.price * c.qty, 0);
    const order = addOrder({
      type: 'instore',
      customer: { name, phone: phones[i] },
      isReservation: false,
      scheduledDate: '',
      scheduledTime: '',
      items: orderItems,
      total,
    });
    if (order.status !== statuses[i]) {
      updateOrderStatus(order.id, statuses[i]);
    }
  });

  // 予約デモデータ
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().slice(0, 10);

  addOrder({
    type: 'takeout',
    customer: { name: '予約 佐々木', phone: '080-0001-0001' },
    isReservation: true,
    scheduledDate: tomorrowStr,
    scheduledTime: '18:00',
    items: [{ id: MENU[0].id, name: MENU[0].name, price: MENU[0].price, qty: 2 },
            { id: MENU[5].id, name: MENU[5].name, price: MENU[5].price, qty: 1 }],
    total: MENU[0].price * 2 + MENU[5].price,
  });
  addOrder({
    type: 'takeout',
    customer: { name: '予約 中村', phone: '090-0002-0002', address: '' },
    isReservation: true,
    scheduledDate: dayAfterStr,
    scheduledTime: '12:30',
    items: [{ id: MENU[10].id, name: MENU[10].name, price: MENU[10].price, qty: 3 }],
    total: MENU[10].price * 3,
  });

  renderStats(getOrders());
  renderTable();
}

function refreshIfChanged() {
  const current = localStorage.getItem('orders') || '[]';
  if (current !== refreshIfChanged._last) {
    refreshIfChanged._last = current;
    renderStats(getOrders());
    renderTable();
  }
}
refreshIfChanged._last = null;

document.addEventListener('DOMContentLoaded', () => {
  renderStats(getOrders());
  renderFilters();
  renderTable();
  refreshIfChanged._last = localStorage.getItem('orders') || '[]';

  document.getElementById('demo-btn').addEventListener('click', addDemoOrders);
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('全注文データを削除しますか？')) {
      localStorage.removeItem('orders');
      refreshIfChanged._last = '[]';
      renderStats(getOrders());
      renderTable();
    }
  });

  // 他タブ（注文アプリ）での変更を3秒ごとに反映
  setInterval(refreshIfChanged, 3000);
});
