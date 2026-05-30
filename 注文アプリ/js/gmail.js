var GMAIL_CLIENT_ID_KEY = 'gmail_client_id';
var GMAIL_KEYWORD_KEY   = 'gmail_keyword';
var gmailToken       = null;
var gmailTokenClient = null;
var gmailBodies      = {};

// ── OAuth ─────────────────────────────────────────────

function initGmailTokenClient() {
  var clientId = document.getElementById('gmail-client-id').value.trim();
  if (!clientId) { alert('Google Client IDを入力してください'); return null; }
  localStorage.setItem(GMAIL_CLIENT_ID_KEY, clientId);

  if (!window.google || !window.google.accounts) {
    alert('Google Identity Services の読み込みに失敗しました。\nページをリロードして再試行してください。');
    return null;
  }

  return google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    callback: function(response) {
      if (response.error) {
        setGmailStatus('エラー: ' + response.error, false);
        return;
      }
      gmailToken = response.access_token;
      setGmailStatus('接続済み', true);
      fetchGmailMessages();
    },
  });
}

function onGmailFetchClick() {
  localStorage.setItem(GMAIL_KEYWORD_KEY, document.getElementById('gmail-keyword').value.trim());

  if (gmailToken) {
    fetchGmailMessages();
    return;
  }

  gmailTokenClient = initGmailTokenClient();
  if (gmailTokenClient) gmailTokenClient.requestAccessToken();
}

function setGmailStatus(text, connected) {
  var el  = document.getElementById('gmail-status');
  var btn = document.getElementById('gmail-fetch-btn');
  el.textContent = text;
  el.className   = 'gmail-status' + (connected ? ' connected' : '');
  btn.textContent = connected ? '📬 メールを再取得' : '📬 Gmailから取得する';
}

// ── Gmail API ──────────────────────────────────────────

async function fetchGmailMessages() {
  var keyword = document.getElementById('gmail-keyword').value.trim() || '注文';
  var btn = document.getElementById('gmail-fetch-btn');
  btn.disabled = true;
  btn.textContent = '取得中…';
  setEmailList('<p class="gmail-empty">取得中…</p>', true);

  try {
    var q = encodeURIComponent('is:unread ' + keyword);
    var listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=' + q + '&maxResults=10',
      { headers: { 'Authorization': 'Bearer ' + gmailToken } }
    );

    if (listRes.status === 401) {
      gmailToken = null;
      setGmailStatus('未接続（期限切れ）', false);
      setEmailList('', false);
      alert('認証が切れました。再度「Gmailから取得する」をクリックしてください。');
      return;
    }

    var listData = await listRes.json();
    var messages = listData.messages || [];

    if (messages.length === 0) {
      setEmailList('<p class="gmail-empty">「' + keyword + '」に一致する未読メールが見つかりません</p>', true);
      return;
    }

    var details = await Promise.all(messages.map(function(msg) {
      return fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + msg.id + '?format=full',
        { headers: { 'Authorization': 'Bearer ' + gmailToken } }
      ).then(function(r) { return r.json(); });
    }));

    renderEmailList(details);
  } catch (e) {
    setEmailList('<p class="gmail-empty">エラー: ' + e.message + '</p>', true);
  } finally {
    btn.disabled = false;
    btn.textContent = '📬 メールを再取得';
  }
}

// ── Email parsing helpers ──────────────────────────────

function decodeBase64url(data) {
  if (!data) return '';
  var b64 = data.replace(/-/g, '+').replace(/_/g, '/');
  try {
    var binary = atob(b64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    try { return decodeURIComponent(escape(atob(b64))); } catch (e2) { return ''; }
  }
}

function extractBody(payload) {
  if (!payload) return '';
  if (payload.body && payload.body.data) return decodeBase64url(payload.body.data);
  if (!payload.parts) return '';
  for (var i = 0; i < payload.parts.length; i++) {
    var part = payload.parts[i];
    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return decodeBase64url(part.body.data);
    }
  }
  for (var j = 0; j < payload.parts.length; j++) {
    var nested = extractBody(payload.parts[j]);
    if (nested) return nested;
  }
  return '';
}

function getHeader(headers, name) {
  if (!headers) return '';
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].name.toLowerCase() === name.toLowerCase()) return headers[i].value;
  }
  return '';
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Render ─────────────────────────────────────────────

function renderEmailList(messages) {
  gmailBodies = {};
  var html = messages.map(function(msg) {
    var headers  = msg.payload ? msg.payload.headers : [];
    var subject  = getHeader(headers, 'Subject') || '(件名なし)';
    var from     = getHeader(headers, 'From')    || '(不明)';
    var date     = getHeader(headers, 'Date')    || '';
    var snippet  = msg.snippet || '';
    var body     = extractBody(msg.payload);

    gmailBodies[msg.id] =
      (subject ? '件名: ' + subject + '\n' : '') +
      (from    ? '差出人: ' + from + '\n\n' : '\n') +
      (body    || snippet);

    return '<div class="gmail-email-item" data-id="' + escHtml(msg.id) + '">' +
      '<div class="gmail-email-meta">' +
        '<span class="gmail-email-from">' + escHtml(from.replace(/<.*>/, '').trim()) + '</span>' +
        '<span class="gmail-email-date">' + escHtml(date.slice(0, 16)) + '</span>' +
      '</div>' +
      '<div class="gmail-email-subject">' + escHtml(subject) + '</div>' +
      '<div class="gmail-email-snippet">' + escHtml(snippet.slice(0, 80)) + '…</div>' +
    '</div>';
  }).join('');

  setEmailList(html, true);

  document.querySelectorAll('.gmail-email-item').forEach(function(el) {
    el.addEventListener('click', function() {
      var id = el.getAttribute('data-id');
      if (!gmailBodies[id]) return;
      document.getElementById('ai-input-text').value = gmailBodies[id];
      document.querySelectorAll('.gmail-email-item').forEach(function(e) { e.classList.remove('selected'); });
      el.classList.add('selected');
      document.getElementById('ai-parse-btn').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

function setEmailList(html, show) {
  var section = document.getElementById('gmail-email-section');
  var list    = document.getElementById('gmail-email-list');
  list.innerHTML = html;
  section.classList.toggle('show', !!show);
}

// ── Init ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  var savedId = localStorage.getItem(GMAIL_CLIENT_ID_KEY);
  if (savedId) document.getElementById('gmail-client-id').value = savedId;

  var savedKw = localStorage.getItem(GMAIL_KEYWORD_KEY);
  if (savedKw) document.getElementById('gmail-keyword').value = savedKw;

  document.getElementById('gmail-fetch-btn').addEventListener('click', onGmailFetchClick);
});
