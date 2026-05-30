let cart = [];
let currentCategory = CATEGORIES[0];
let isReservation = false;

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const items = MENU.filter(m => m.category === currentCategory);
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-card-emoji">${item.emoji}</div>
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.desc}</div>
      </div>
      <div class="menu-card-footer">
        <span class="menu-price">¥${item.price.toLocaleString()}</span>
        <button class="add-btn" onclick="addToCart('${item.id}')">追加</button>
      </div>
    </div>
  `).join('');
}

function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = CATEGORIES.map(cat => `
    <button class="tab ${cat === currentCategory ? 'active' : ''}" onclick="switchTab('${cat}')">${cat}</button>
  `).join('');
}

function switchTab(cat) {
  currentCategory = cat;
  renderTabs();
  renderMenu();
}

function addToCart(id) {
  const item = MENU.find(m => m.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  updateCartBadge();
  renderCartItems();
  showCartFeedback(id);
}

function showCartFeedback(id) {
  const btns = document.querySelectorAll('.add-btn');
  const idx = MENU.filter(m => m.category === currentCategory).findIndex(m => m.id === id);
  if (btns[idx]) {
    const btn = btns[idx];
    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.background = '#10b981';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 600);
  }
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  if (cart.length === 0) {
    el.innerHTML = '<p class="cart-empty">カートは空です</p>';
    document.getElementById('checkout-btn').disabled = true;
    document.getElementById('cart-total-price').textContent = '¥0';
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">＋</button>
      </div>
      <span class="cart-item-price">¥${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-total-price').textContent = `¥${total.toLocaleString()}`;
  document.getElementById('checkout-btn').disabled = false;
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartBadge();
  renderCartItems();
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sidebar').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sidebar').classList.remove('open');
}

function openOrderModal() {
  closeCart();
  const items = cart.map(c => `${c.name} × ${c.qty}`).join('、');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('summary-items').textContent = items;
  document.getElementById('summary-total').textContent = `¥${total.toLocaleString()}`;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearFormErrors();
}

function setTiming(type) {
  isReservation = type === 'reserve';
  document.querySelectorAll('.timing-btn').forEach(b => b.classList.toggle('active', b.dataset.timing === type));
  const fields = document.getElementById('reservation-fields');
  if (isReservation) {
    fields.classList.add('show');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 10);
    const dateInput = document.getElementById('scheduled-date');
    dateInput.min = minDate;
    if (!dateInput.value) dateInput.value = minDate;
  } else {
    fields.classList.remove('show');
  }
}

function clearFormErrors() {
  document.querySelectorAll('.form-group input').forEach(i => i.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}

function validateForm() {
  let valid = true;
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  clearFormErrors();

  if (!name) { markError('customer-name', 'name-error'); valid = false; }
  if (!phone || !/^[\d\-+() ]{7,}$/.test(phone)) { markError('customer-phone', 'phone-error'); valid = false; }
  if (isReservation) {
    const date = document.getElementById('scheduled-date').value;
    const time = document.getElementById('scheduled-time').value;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (!date || date < tomorrow.toISOString().slice(0, 10)) { markError('scheduled-date', 'date-error'); valid = false; }
    if (!time) { markError('scheduled-time', 'time-error'); valid = false; }
  }
  return valid;
}

function markError(inputId, errorId) {
  document.getElementById(inputId).classList.add('error');
  document.getElementById(errorId).classList.add('show');
}

function confirmOrder() {
  if (!validateForm()) return;
  const order = {
    type: isReservation ? 'takeout' : 'instore',
    customer: {
      name: document.getElementById('customer-name').value.trim(),
      phone: document.getElementById('customer-phone').value.trim(),
    },
    isReservation,
    scheduledDate: isReservation ? document.getElementById('scheduled-date').value : '',
    scheduledTime: isReservation ? document.getElementById('scheduled-time').value : '',
    items: cart.map(c => ({ ...c })),
    total: cart.reduce((s, c) => s + c.price * c.qty, 0),
  };
  const saved = addOrder(order);
  closeModal();
  showComplete(saved.id);
  cart = [];
  updateCartBadge();
  renderCartItems();
}

function showComplete(orderId) {
  document.getElementById('complete-order-id').textContent = orderId;
  document.getElementById('complete-message').textContent = isReservation
    ? 'ご予約を承りました。当日お待ちしております。'
    : 'ご準備が整いましたらお呼びします。';
  document.getElementById('complete-screen').classList.add('open');
}

function resetApp() {
  document.getElementById('complete-screen').classList.remove('open');
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('scheduled-date').value = '';
  document.getElementById('scheduled-time').value = '';
  isReservation = false;
  document.querySelectorAll('.timing-btn').forEach(b => b.classList.toggle('active', b.dataset.timing === 'now'));
  document.getElementById('reservation-fields').classList.remove('show');
}

function toHiragana(str) {
  // カタカナ→ひらがな変換
  return str.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderMenu();
  renderCartItems();

  // 名前欄：入力をひらがなに変換
  const nameInput = document.getElementById('customer-name');
  nameInput.addEventListener('input', () => {
    const pos = nameInput.selectionStart;
    nameInput.value = toHiragana(nameInput.value);
    nameInput.setSelectionRange(pos, pos);
  });

  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('close-cart-btn').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', openOrderModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmOrder);
  document.getElementById('back-to-menu').addEventListener('click', resetApp);

  document.querySelectorAll('.timing-btn').forEach(btn => {
    btn.addEventListener('click', () => setTiming(btn.dataset.timing));
  });
});
