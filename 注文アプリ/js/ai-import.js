var AI_KEY_STORAGE = 'ai_import_api_key';
var parsedOrderData = null;

function loadSavedApiKey() {
  var key = localStorage.getItem(AI_KEY_STORAGE) || '';
  if (key) document.getElementById('ai-api-key').value = key;
}

function toggleAiPanel() {
  var body = document.getElementById('ai-import-body');
  var icon = document.querySelector('.ai-toggle-icon');
  var isOpen = body.classList.toggle('open');
  icon.textContent = isOpen ? '▲' : '▼';
}

async function parseOrderText() {
  var apiKey = document.getElementById('ai-api-key').value.trim();
  if (!apiKey) { alert('Anthropic APIキーを入力してください'); return; }
  localStorage.setItem(AI_KEY_STORAGE, apiKey);

  var text = document.getElementById('ai-input-text').value.trim();
  if (!text) { alert('解析するテキストを貼り付けてください'); return; }

  var btn = document.getElementById('ai-parse-btn');
  btn.disabled = true;
  btn.textContent = '解析中…';
  document.getElementById('ai-result').classList.remove('show');

  var prompt = `以下のメール・LINEテキストから注文情報を抽出し、JSONのみで返してください（コードブロックなし）。

フィールド定義:
- customer_name: 顧客名（string）
- phone: 電話番号（string、なければ空文字）
- items: 商品リスト（array）各要素: { name: string, qty: number, price: number（テキストに金額があれば数値、なければ0）}
- delivery_date: 希望日時（string、なければ空文字）
- order_type: "delivery"（配達）または "takeout"（持帰り）
- address: 配達先住所（string、なければ空文字）
- payment: 支払方法（string、なければ空文字）
- notes: 備考（string、なければ空文字）

テキスト:
${text}`;

  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      var errData = await res.json();
      throw new Error(errData.error ? errData.error.message : 'APIエラー (' + res.status + ')');
    }

    var data = await res.json();
    var parsed = JSON.parse(data.content[0].text.trim());
    showResult(parsed);
  } catch (e) {
    alert('解析エラー: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 AIで解析する';
  }
}

function showResult(data) {
  parsedOrderData = data;

  var items = data.items || [];
  var total = items.reduce(function(s, i) { return s + (i.price || 0) * (i.qty || 1); }, 0);

  document.getElementById('ai-result-name').textContent    = data.customer_name || '（不明）';
  document.getElementById('ai-result-phone').textContent   = data.phone || '―';
  document.getElementById('ai-result-type').textContent    = data.order_type === 'delivery' ? '🛵 配達' : '🏃 テイクアウト';
  document.getElementById('ai-result-date').textContent    = data.delivery_date || '―';
  document.getElementById('ai-result-payment').textContent = data.payment || '―';
  document.getElementById('ai-result-notes').textContent   = data.notes || '―';
  document.getElementById('ai-result-total').textContent   = total > 0 ? '¥' + total.toLocaleString() : '―（テキストに金額なし）';
  document.getElementById('ai-result-items').innerHTML = items.length
    ? items.map(function(i) {
        return '<li>' + i.name + ' × ' + (i.qty || 1) + (i.price ? '（¥' + Number(i.price).toLocaleString() + '）' : '') + '</li>';
      }).join('')
    : '<li>（商品情報なし）</li>';

  document.getElementById('ai-result').classList.add('show');
}

function importParsedOrder() {
  if (!parsedOrderData) return;

  var items = (parsedOrderData.items || []).map(function(item) {
    var menuMatch = MENU.find(function(m) { return m.name === item.name; });
    return {
      id: menuMatch ? menuMatch.id : 'ai-' + Math.random().toString(36).slice(2, 8),
      name: item.name,
      price: item.price || (menuMatch ? menuMatch.price : 0),
      qty: item.qty || 1,
    };
  });

  var total = items.reduce(function(s, i) { return s + i.price * i.qty; }, 0);

  var order = {
    type: parsedOrderData.order_type || 'takeout',
    customer: {
      name: parsedOrderData.customer_name || '（不明）',
      phone: parsedOrderData.phone || '',
      address: parsedOrderData.address || '',
    },
    scheduledTime: parsedOrderData.delivery_date || '',
    items: items,
    total: total,
    notes: parsedOrderData.notes || '',
    source: 'ai-import',
  };

  addOrder(order);
  renderStats(getOrders());
  renderTable();

  document.getElementById('ai-input-text').value = '';
  document.getElementById('ai-result').classList.remove('show');
  parsedOrderData = null;

  var btn = document.getElementById('ai-import-btn');
  var origText = btn.textContent;
  btn.textContent = '✓ 追加しました';
  btn.style.background = '#10b981';
  setTimeout(function() {
    btn.textContent = origText;
    btn.style.background = '';
  }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
  loadSavedApiKey();
  document.getElementById('ai-toggle-btn').addEventListener('click', toggleAiPanel);
  document.getElementById('ai-parse-btn').addEventListener('click', parseOrderText);
  document.getElementById('ai-import-btn').addEventListener('click', importParsedOrder);
});
