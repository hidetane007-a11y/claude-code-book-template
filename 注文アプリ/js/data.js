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

// ── Supabase クライアント初期化 ───────────────────────────────────────────────
const _sb = (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── データ操作（Supabase / localStorage 自動切替） ────────────────────────────

async function getOrders() {
  if (!_sb) {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }
  const { data, error } = await _sb
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(row => ({ ...row.data, id: row.id, status: row.status, createdAt: row.created_at }));
}

async function addOrder(order) {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  order.status  = 'pending';
  order.createdAt = date.toISOString();

  if (!_sb) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const seq = String(orders.filter(o => o.id && o.id.includes(datePart)).length + 1).padStart(3, '0');
    order.id = `ORD-${datePart}-${seq}`;
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    return order;
  }

  const { count } = await _sb
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .like('id', `ORD-${datePart}-%`);
  const seq = String((count || 0) + 1).padStart(3, '0');
  order.id = `ORD-${datePart}-${seq}`;

  const { error } = await _sb.from('orders').insert({
    id: order.id,
    status: order.status,
    is_reservation: !!order.isReservation,
    created_at: order.createdAt,
    data: order,
  });
  if (error) throw error;
  return order;
}

async function updateOrderStatus(id, status) {
  if (!_sb) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const o = orders.find(o => o.id === id);
    if (o) { o.status = status; localStorage.setItem('orders', JSON.stringify(orders)); }
    return;
  }
  const { error } = await _sb.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}
