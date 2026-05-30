const MENU = [
  // ── メイン惣菜 ──
  { id: '1',  category: 'メイン惣菜', name: 'ヤンニョムチキン',   price: 980,  emoji: '🍗', desc: '甘辛ヤンニョムダレのサクサクチキン' },
  { id: '2',  category: 'メイン惣菜', name: 'プルコギ',           price: 1100, emoji: '🥩', desc: '甘口醤油ダレで炒めた牛肉と野菜' },
  { id: '3',  category: 'メイン惣菜', name: 'チャプチェ',         price: 900,  emoji: '🍜', desc: '春雨と野菜・牛肉の甘辛炒め' },
  { id: '4',  category: 'メイン惣菜', name: 'カルビ煮込み',       price: 1200, emoji: '🍖', desc: 'コチュジャン仕立ての骨付きカルビ' },
  { id: '5',  category: 'メイン惣菜', name: 'タッカルビ',         price: 1050, emoji: '🌶️', desc: '鶏肉と野菜の辛口鉄板炒め' },
  // ── 副菜・おかず ──
  { id: '6',  category: '副菜',       name: '白菜キムチ',         price: 380,  emoji: '🥬', desc: '自家製ヤンニョムの熟成白菜キムチ' },
  { id: '7',  category: '副菜',       name: 'カクテキ',           price: 350,  emoji: '🟠', desc: '大根の角切りキムチ、さっぱり辛口' },
  { id: '8',  category: '副菜',       name: 'ほうれん草ナムル',   price: 300,  emoji: '🌿', desc: 'ごま油香るほうれん草の和え物' },
  { id: '9',  category: '副菜',       name: 'チヂミ',             price: 650,  emoji: '🥞', desc: 'ねぎとエビ入りの香ばしいチヂミ' },
  { id: '10', category: '副菜',       name: 'スンドゥブ',         price: 750,  emoji: '🍲', desc: '純豆腐と海鮮の辛口チゲ（1人前）' },
  // ── ご飯もの ──
  { id: '11', category: 'ご飯もの',   name: 'ビビンバ',           price: 850,  emoji: '🍚', desc: '5種ナムルと甘辛プルコギのっけ' },
  { id: '12', category: 'ご飯もの',   name: '石焼ビビンバ',       price: 980,  emoji: '🔥', desc: 'おこげが香ばしい石焼き仕立て' },
  { id: '13', category: 'ご飯もの',   name: 'クッパ',             price: 800,  emoji: '🍜', desc: '牛骨スープとご飯、薬味たっぷり' },
  { id: '14', category: 'ご飯もの',   name: '白ご飯',             price: 200,  emoji: '🍙', desc: 'おかずのお供に（大盛り +50円）' },
];

const CATEGORIES = ['メイン惣菜', '副菜', 'ご飯もの'];

const STATUS_LABELS = {
  pending:   { text: '受付済',   next: 'preparing', color: '#f59e0b' },
  preparing: { text: '調理中',   next: 'ready',     color: '#3b82f6' },
  ready:     { text: '準備完了', next: 'delivered',  color: '#10b981' },
  delivered: { text: '完了',     next: null,         color: '#6b7280' },
};

function getOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(order) {
  const orders = getOrders();
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(orders.filter(o => o.id.includes(datePart)).length + 1).padStart(3, '0');
  order.id = `ORD-${datePart}-${seq}`;
  order.status = 'pending';
  order.createdAt = date.toISOString();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    saveOrders(orders);
  }
}
