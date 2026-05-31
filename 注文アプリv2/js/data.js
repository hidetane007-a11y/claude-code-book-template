var MENU = [
  { id: '1',  category: 'メイン惣菜', name: 'ヤンニョムチキン',   price: 980,  emoji: '🍗', desc: '甘辛ヤンニョムダレのサクサクチキン' },
  { id: '2',  category: 'メイン惣菜', name: 'プルコギ',           price: 1100, emoji: '🥩', desc: '甘口醤油ダレで炒めた牛肉と野菜' },
  { id: '3',  category: 'メイン惣菜', name: 'チャプチェ',         price: 900,  emoji: '🍜', desc: '春雨と野菜・牛肉の甘辛炒め' },
  { id: '4',  category: 'メイン惣菜', name: 'カルビ煮込み',       price: 1200, emoji: '🍖', desc: 'コチュジャン仕立ての骨付きカルビ' },
  { id: '5',  category: 'メイン惣菜', name: 'タッカルビ',         price: 1050, emoji: '🌶️', desc: '鶏肉と野菜の辛口鉄板炒め' },
  { id: '6',  category: '副菜',       name: '白菜キムチ',         price: 380,  emoji: '🥬', desc: '自家製ヤンニョムの熟成白菜キムチ' },
  { id: '7',  category: '副菜',       name: 'カクテキ',           price: 350,  emoji: '🟠', desc: '大根の角切りキムチ、さっぱり辛口' },
  { id: '8',  category: '副菜',       name: 'ほうれん草ナムル',   price: 300,  emoji: '🌿', desc: 'ごま油香るほうれん草の和え物' },
  { id: '9',  category: '副菜',       name: 'チヂミ',             price: 650,  emoji: '🥞', desc: 'ねぎとエビ入りの香ばしいチヂミ' },
  { id: '10', category: '副菜',       name: 'スンドゥブ',         price: 750,  emoji: '🍲', desc: '純豆腐と海鮮の辛口チゲ（1人前）' },
  { id: '11', category: 'ご飯もの',   name: 'ビビンバ',           price: 850,  emoji: '🍚', desc: '5種ナムルと甘辛プルコギのっけ' },
  { id: '12', category: 'ご飯もの',   name: '石焼ビビンバ',       price: 980,  emoji: '🔥', desc: 'おこげが香ばしい石焼き仕立て' },
  { id: '13', category: 'ご飯もの',   name: 'クッパ',             price: 800,  emoji: '🍜', desc: '牛骨スープとご飯、薬味たっぷり' },
  { id: '14', category: 'ご飯もの',   name: '白ご飯',             price: 200,  emoji: '🍙', desc: 'おかずのお供に（大盛り +50円）' },
];

var CATEGORIES = ['メイン惣菜', '副菜', 'ご飯もの'];

var STATUS_LABELS = {
  pending:   { text: '受付済',   next: 'preparing', color: '#f59e0b' },
  preparing: { text: '調理中',   next: 'ready',     color: '#3b82f6' },
  ready:     { text: '準備完了', next: 'delivered',  color: '#10b981' },
  delivered: { text: '完了',     next: null,         color: '#6b7280' },
};

// Supabase JS client (realtime only)
var _sb = null;
try {
  if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && typeof supabase !== 'undefined') {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {}

function _sbReady() {
  return typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL';
}

// ── getOrders ────────────────────────────────────────────────────────────────

function getOrders() {
  if (!_sbReady()) {
    return Promise.resolve(JSON.parse(localStorage.getItem('orders') || '[]'));
  }
  return fetch(SUPABASE_URL + '/rest/v1/orders?order=created_at.desc', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Accept': 'application/json',
    },
  }).then(function(r) {
    if (!r.ok) return [];
    return r.json();
  }).then(function(data) {
    return data.map(function(row) {
      return Object.assign({}, row.data, { id: row.id, status: row.status, createdAt: row.created_at });
    });
  }).catch(function() { return []; });
}

// ── addOrder ─────────────────────────────────────────────────────────────────

function addOrder(order) {
  var d = new Date();
  var dp = d.toISOString().slice(0, 10).replace(/-/g, '');
  order.status = 'pending';
  order.createdAt = d.toISOString();

  if (!_sbReady()) {
    var ls = JSON.parse(localStorage.getItem('orders') || '[]');
    var n = ls.filter(function(o) { return o.id && o.id.indexOf(dp) !== -1; }).length + 1;
    order.id = 'ORD-' + dp + '-' + String(n).padStart(3, '0');
    ls.unshift(order);
    localStorage.setItem('orders', JSON.stringify(ls));
    return Promise.resolve(order);
  }

  var ts = d.toTimeString().slice(0, 8).replace(/:/g, '');
  var rn = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  order.id = 'ORD-' + dp + '-' + ts + '-' + rn;

  return fetch(SUPABASE_URL + '/rest/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      id: order.id,
      status: order.status,
      is_reservation: !!order.isReservation,
      created_at: order.createdAt,
      data: order,
    }),
  }).then(function(r) {
    if (!r.ok) {
      return r.text().then(function(b) { throw new Error('HTTP ' + r.status + ': ' + b); });
    }
    return order;
  });
}

// ── updateOrderStatus ────────────────────────────────────────────────────────

function updateOrderStatus(id, status) {
  if (!_sbReady()) {
    var orders = JSON.parse(localStorage.getItem('orders') || '[]');
    var o = orders.find(function(x) { return x.id === id; });
    if (o) { o.status = status; localStorage.setItem('orders', JSON.stringify(orders)); }
    return Promise.resolve();
  }
  return fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ status: status }),
  }).then(function(r) {
    if (!r.ok) throw new Error('updateOrderStatus HTTP ' + r.status);
  });
}

// ── updateOrderTable ─────────────────────────────────────────────────────────

function updateOrderTable(id, tableNumber) {
  if (!_sbReady()) {
    var orders = JSON.parse(localStorage.getItem('orders') || '[]');
    var o = orders.find(function(x) { return x.id === id; });
    if (o) { o.tableNumber = tableNumber; localStorage.setItem('orders', JSON.stringify(orders)); }
    return Promise.resolve();
  }
  return fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + encodeURIComponent(id) + '&select=data', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Accept': 'application/json',
    },
  }).then(function(r) {
    if (!r.ok) throw new Error('updateOrderTable GET HTTP ' + r.status);
    return r.json();
  }).then(function(rows) {
    if (!rows.length) return;
    var newData = Object.assign({}, rows[0].data, { tableNumber: tableNumber });
    return fetch(SUPABASE_URL + '/rest/v1/orders?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ data: newData }),
    }).then(function(r) {
      if (!r.ok) throw new Error('updateOrderTable PATCH HTTP ' + r.status);
    });
  });
}
