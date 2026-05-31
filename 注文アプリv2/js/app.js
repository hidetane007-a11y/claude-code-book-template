let cart = [];
let currentCategory = CATEGORIES[0];
let isReservation = false;
let selectedTableNumber = null;

// ── Menu ─────────────────────────────────────────────────────────

function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const items = MENU.filter(m => m.category === currentCategory);
  grid.innerHTML = items.map(item => {
    const cartItem = cart.find(c => c.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;
    const control = qty > 0
      ? `<div class="qty-ctrl">
           <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
           <span class="qty-num">${qty}</span>
           <button class="qty-btn" onclick="changeQty('${item.id}',1)">＋</button>
         </div>`
      : `<button class="add-btn" onclick="addToCart('${item.id}')">追加</button>`;
    return `
      <div class="menu-card">
        <div class="menu-card-emoji">${item.emoji}</div>
        <div class="menu-card-body">
          <div class="menu-card-name">${item.name}</div>
          <div class="menu-card-desc">${item.desc}</div>
        </div>
        <div class="menu-card-footer">
          <span class="menu-price">¥${item.price.toLocaleString()}</span>
          ${control}
        </div>
      </div>`;
  }).join('');
}

function renderTabs() {
  document.getElementById('tabs').innerHTML = CATEGORIES.map(cat => `
    <button class="tab ${cat === currentCategory ? 'active' : ''}"
            onclick="switchTab('${cat}')">${cat}</button>
  `).join('');
}

function switchTab(cat) {
  currentCategory = cat;
  renderTabs();
  renderMenu();
}

// ── Cart ─────────────────────────────────────────────────────────

function addToCart(id) {
  const item = MENU.find(m => m.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  updateCart();
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCart();
}

function updateCart() {
  renderMenu();
  renderCartItems();
  updateBottomBar();
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (cart.length === 0) {
    el.innerHTML = '<p class="cart-empty">カートは空です</p>';
    document.getElementById('cart-total-price').textContent = '¥0';
    checkoutBtn.disabled = true;
    return;
  }

  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)">＋</button>
      </div>
      <span class="cart-item-price">¥${(item.price * item.qty).toLocaleString()}</span>
    </div>
  `).join('');

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-total-price').textContent = `¥${total.toLocaleString()}`;
  checkoutBtn.disabled = false;
}

function updateBottomBar() {
  const bar = document.getElementById('cart-bottom-bar');
  const btn = document.getElementById('cart-bottom-btn');
  if (cart.length === 0) {
    bar.classList.add('hidden');
    btn.disabled = true;
    return;
  }
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('cart-bottom-count').textContent = `${count}点`;
  document.getElementById('cart-bottom-total').textContent = `¥${total.toLocaleString()}`;
  document.getElementById('cart-badge').textContent = count;
  bar.classList.remove('hidden');
  btn.disabled = false;
}

// ── Cart panel open/close (portrait) ─────────────────────────────

function openCart() {
  document.getElementById('cart-panel').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

// ── Order Modal ───────────────────────────────────────────────────

function openOrderModal() {
  closeCart();
  const items = cart.map(c => `${c.name} × ${c.qty}`).join('、');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById('summary-items').textContent = items;
  document.getElementById('summary-total').textContent = `¥${total.toLocaleString()}`;
  renderTableNumberGrid();
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  clearFormErrors();
}

// ── Table number ──────────────────────────────────────────────────

function renderTableNumberGrid() {
  document.getElementById('table-number-grid').innerHTML =
    Array.from({ length: 10 }, (_, i) => i + 1).map(n => `
      <button class="table-number-btn ${selectedTableNumber === n ? 'selected' : ''}"
              onclick="selectTable(${n})">${n}</button>
    `).join('');
}

function selectTable(n) {
  selectedTableNumber = n;
  renderTableNumberGrid();
}

// ── Order type toggle ─────────────────────────────────────────────

function setTiming(type) {
  isReservation = type === 'reserve';
  document.querySelectorAll('.timing-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.timing === type)
  );
  const tableGroup = document.getElementById('table-number-group');
  const resFields  = document.getElementById('reservation-fields');

  if (isReservation) {
    tableGroup.style.display = 'none';
    resFields.classList.add('show');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 10);
    const dateInput = document.getElementById('scheduled-date');
    dateInput.min = minDate;
    if (!dateInput.value) dateInput.value = minDate;
  } else {
    tableGroup.style.display = '';
    resFields.classList.remove('show');
  }
}

// ── Validation ────────────────────────────────────────────────────

function clearFormErrors() {
  document.querySelectorAll('.form-group input').forEach(i => i.classList.remove('error'));
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}

function markError(inputId, errorId) {
  const input = document.getElementById(inputId);
  if (input) input.classList.add('error');
  document.getElementById(errorId).classList.add('show');
}

function validateForm() {
  clearFormErrors();
  let valid = true;
  const name  = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();

  if (!name)  { markError('customer-name', 'name-error'); valid = false; }
  if (!phone || !/^[\d\-+() ]{7,}$/.test(phone)) { markError('customer-phone', 'phone-error'); valid = false; }

  if (!isReservation) {
    if (!selectedTableNumber) {
      document.getElementById('table-error').classList.add('show');
      valid = false;
    }
  } else {
    const date = document.getElementById('scheduled-date').value;
    const time = document.getElementById('scheduled-time').value;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (!date || date < tomorrow.toISOString().slice(0, 10)) { markError('scheduled-date', 'date-error'); valid = false; }
    if (!time) { markError('scheduled-time', 'time-error'); valid = false; }
  }
  return valid;
}

// ── Confirm & Complete ────────────────────────────────────────────

async function confirmOrder() {
  if (!validateForm()) return;

  const btn = document.getElementById('modal-confirm');
  btn.disabled = true;
  btn.textContent = '送信中…';

  const order = {
    type: isReservation ? 'takeout' : 'instore',
    tableNumber: isReservation ? null : selectedTableNumber,
    customer: {
      name:  document.getElementById('customer-name').value.trim(),
      phone: document.getElementById('customer-phone').value.trim(),
    },
    isReservation,
    scheduledDate: isReservation ? document.getElementById('scheduled-date').value : '',
    scheduledTime: isReservation ? document.getElementById('scheduled-time').value : '',
    items: cart.map(c => ({ ...c })),
    total: cart.reduce((s, c) => s + c.price * c.qty, 0),
  };

  try {
    const saved = await addOrder(order);
    closeModal();
    cart = [];
    selectedTableNumber = null;
    updateCart();
    showComplete(saved.id);
  } catch {
    alert('注文の送信に失敗しました。もう一度お試しください。');
    btn.disabled = false;
    btn.textContent = '注文を確定する';
  }
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
  document.getElementById('customer-name').value  = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('scheduled-date').value = '';
  document.getElementById('scheduled-time').value = '';
  isReservation = false;
  selectedTableNumber = null;
  document.querySelectorAll('.timing-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.timing === 'now')
  );
  document.getElementById('reservation-fields').classList.remove('show');
  document.getElementById('table-number-group').style.display = '';
  document.getElementById('modal-confirm').disabled = false;
  document.getElementById('modal-confirm').textContent = '注文を確定する';
  renderTableNumberGrid();
}

// ── Init ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderTabs();
  renderMenu();
  renderCartItems();
  renderTableNumberGrid();

  document.getElementById('cart-header-btn').addEventListener('click', openCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('cart-close-btn').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', openOrderModal);
  document.getElementById('cart-bottom-btn').addEventListener('click', openCart);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-confirm').addEventListener('click', confirmOrder);
  document.getElementById('back-to-menu').addEventListener('click', resetApp);

  document.querySelectorAll('.timing-btn').forEach(btn =>
    btn.addEventListener('click', () => setTiming(btn.dataset.timing))
  );
});
