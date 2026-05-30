let cart = [];
let currentCategory = CATEGORIES[0];
let orderType = 'delivery';

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
  setOrderType(orderType);
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearFormErrors();
}

function setOrderType(type) {
  orderType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
  const addrGroup = document.getElementById('address-group');
  if (type === 'delivery') {
    addrGroup.classList.add('show');
  } else {
    addrGroup.classList.remove('show');
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
  const address = document.getElementById('customer-address').value.trim();
  clearFormErrors();

  if (!name) { markError('customer-name', 'name-error'); valid = false; }
  if (!phone || !/^[\d\-+() ]{7,}$/.test(phone)) { markError('customer-phone', 'phone-error'); valid = false; }
  if (orderType === 'delivery' && !address) { markError('customer-address', 'address-error'); valid = false; }
  return valid;
}

function markError(inputId, errorId) {
  document.getElementById(inputId).classList.add('error');
  document.getElementById(errorId).classList.add('show');
}

function confirmOrder() {
  if (!validateForm()) return;
  const order = {
    type: orderType,
    customer: {
      name: document.getElementById('customer-name').value.trim(),
      phone: document.getElementById('customer-phone').value.trim(),
      address: orderType === 'delivery' ? document.getElementById('customer-address').value.trim() : '',
    },
    scheduledTime: document.getElementById('scheduled-time').value,
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
  document.getElementById('complete-screen').classList.add('open');
}

function resetApp() {
  document.getElementById('complete-screen').classList.remove('open');
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('customer-address').value = '';
  document.getElementById('scheduled-time').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderMenu();
  renderCartItems();

  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('close-cart-btn').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', openOrderModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmOrder);
  document.getElementById('back-to-menu').addEventListener('click', resetApp);

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => setOrderType(btn.dataset.type));
  });
});
