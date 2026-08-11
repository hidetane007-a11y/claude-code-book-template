const HISTORY_LEN = 30;

const METRICS = {
  temp:     { min: 5,   max: 35,   warnMargin: 3,   decimals: 1, start: 24.5, step: 0.5, floor: -5,  ceil: 42,  fmt: v => v.toFixed(1) },
  humidity: { min: 40,  max: 85,   warnMargin: 5,   decimals: 0, start: 62,   step: 2,   floor: 20,  ceil: 100, fmt: v => Math.round(v) },
  co2:      { min: 400, max: 1200, warnMargin: 100, decimals: 0, start: 650, step: 25,  floor: 350, ceil: 1600, fmt: v => Math.round(v) },
  soil:     { min: 25,  max: 70,   warnMargin: 5,   decimals: 0, start: 48,   step: 1.8, floor: 5,   ceil: 95,  fmt: v => Math.round(v) },
  light:    { min: 2,   max: 90,   warnMargin: 5,   decimals: 1, start: 35,   step: 3.5, floor: 0,   ceil: 100, fmt: v => v.toFixed(1) },
};

const STATUS_LABEL = { good: '正常', warning: '注意', critical: '警報' };
const STATUS_ICON = { good: '✓', warning: '▲', critical: '✕' };

const state = {
  running: true,
  values: {},
  history: {},
  irrigation: { countdown: randInt(15 * 60, 40 * 60), watering: false, lastRun: null },
  curtain: { open: false, pct: 0 },
  co2gen: { pct: 100 },
  network: { bars: 4 },
};

for (const key of Object.keys(METRICS)) {
  state.values[key] = METRICS[key].start;
  state.history[key] = new Array(HISTORY_LEN).fill(METRICS[key].start);
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function classify(value, cfg) {
  if (value < cfg.min || value > cfg.max) return 'critical';
  if (value < cfg.min + cfg.warnMargin || value > cfg.max - cfg.warnMargin) return 'warning';
  return 'good';
}

function nowLabel() {
  return new Date().toLocaleTimeString('ja-JP', { hour12: false });
}

function logEvent(message, level = 'good') {
  const log = document.getElementById('eventLog');
  const li = document.createElement('li');
  li.className = `level-${level}`;
  li.innerHTML = `<time>${nowLabel()}</time><span class="msg">${message}</span>`;
  log.prepend(li);
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

function setStatusPill(el, level, label) {
  el.classList.remove('good', 'warning', 'critical');
  el.classList.add(level);
  el.querySelector('.pill-icon').textContent = STATUS_ICON[level];
  el.querySelector('.pill-label').textContent = label ?? STATUS_LABEL[level];
}

function sparklinePoints(history) {
  const w = 100, h = 30, pad = 3;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = (max - min) || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return [x, y];
  });
  return pts;
}

const cardStatus = {};

function updateMetricCard(key, cfg) {
  const card = document.querySelector(`.stat-card[data-metric="${key}"]`);
  const value = state.values[key];
  card.querySelector('[data-value]').textContent = cfg.fmt(value);

  const level = classify(value, cfg);
  setStatusPill(card.querySelector('[data-status]'), level);

  const prev = cardStatus[key];
  if (prev && prev !== level) {
    const names = { temp: '気温', humidity: '湿度', co2: 'CO2濃度', soil: '土壌水分', light: '日射・照度' };
    logEvent(`${names[key]}が${STATUS_LABEL[level]}域に変化しました（${cfg.fmt(value)}）`, level);
  }
  cardStatus[key] = level;

  const pts = sparklinePoints(state.history[key]);
  const svg = card.querySelector('[data-spark]');
  svg.querySelector('polyline').setAttribute('points', pts.map(p => p.join(',')).join(' '));
  const last = pts[pts.length - 1];
  const circle = svg.querySelector('circle');
  circle.setAttribute('cx', last[0]);
  circle.setAttribute('cy', last[1]);
}

function tickMetrics() {
  for (const [key, cfg] of Object.entries(METRICS)) {
    let v = state.values[key] + (Math.random() - 0.5) * 2 * cfg.step;
    v = clamp(v, cfg.floor, cfg.ceil);
    state.values[key] = v;
    const hist = state.history[key];
    hist.push(v);
    if (hist.length > HISTORY_LEN) hist.shift();
    updateMetricCard(key, cfg);
  }
  document.getElementById('lastUpdated').textContent = `最終更新 ${nowLabel()}`;
}

function updateNetwork() {
  state.network.bars = clamp(state.network.bars + randInt(-1, 2), 1, 4);
  const bars = state.network.bars;
  const card = document.querySelector('.equip-card[data-equip="network"]');
  card.querySelectorAll('[data-signal-bars] span').forEach((span, i) => {
    span.classList.toggle('on', i < bars);
  });
  const level = bars >= 3 ? 'good' : bars === 2 ? 'warning' : 'critical';
  const label = bars >= 3 ? '電波強度: 強' : bars === 2 ? '電波強度: やや弱い' : '電波強度: 弱い';
  card.querySelector('[data-signal-label]').textContent = label;
  setStatusPill(card.querySelector('[data-status]'), level, { good: '良好', warning: 'やや不安定', critical: '圏外注意' }[level]);

  const connBadge = document.getElementById('connBadge');
  setStatusPill(connBadge, level, level === 'good' ? '通信良好' : level === 'warning' ? '通信やや不安定' : '通信圏外注意');
}

function updateCo2Gen() {
  state.co2gen.pct = clamp(state.co2gen.pct - Math.random() * 0.15, 0, 100);
  const card = document.querySelector('.equip-card[data-equip="co2gen"]');
  card.querySelector('[data-co2gen-fill]').style.width = `${state.co2gen.pct}%`;
  card.querySelector('[data-co2gen-pct]').textContent = `${Math.round(state.co2gen.pct)}%`;
  const daysLeft = Math.max(1, Math.round(state.co2gen.pct * 0.3));
  card.querySelector('[data-co2gen-days]').textContent = `約${daysLeft}日後`;
  const level = state.co2gen.pct >= 30 ? 'good' : state.co2gen.pct >= 10 ? 'warning' : 'critical';
  setStatusPill(card.querySelector('[data-status]'), level, { good: '十分', warning: '残り少', critical: '要交換' }[level]);
}

function updateIrrigation() {
  const card = document.querySelector('.equip-card[data-equip="irrigation"]');
  const irr = state.irrigation;

  if (irr.watering) {
    irr.wateringLeft -= 1;
    if (irr.wateringLeft <= 0) {
      irr.watering = false;
      irr.lastRun = nowLabel();
      irr.countdown = randInt(15 * 60, 40 * 60);
      logEvent('灌水を実行しました', 'good');
    }
  } else {
    irr.countdown -= 1;
    if (irr.countdown <= 0) {
      irr.watering = true;
      irr.wateringLeft = 8;
    }
  }

  const m = Math.floor(Math.max(0, irr.countdown) / 60).toString().padStart(2, '0');
  const s = Math.max(0, irr.countdown % 60).toString().padStart(2, '0');
  card.querySelector('[data-irrigation-countdown]').textContent = irr.watering ? '実行中' : `${m}:${s}`;
  card.querySelector('[data-irrigation-last]').textContent = irr.lastRun ?? '--:--:--';
  setStatusPill(card.querySelector('[data-status]'), 'good', irr.watering ? '稼働中' : '待機中');
}

function updateCameraClocks() {
  document.querySelectorAll('[data-camtime]').forEach(el => { el.textContent = nowLabel(); });
}

function setupCurtainToggle() {
  const card = document.querySelector('.equip-card[data-equip="curtain"]');
  const btn = card.querySelector('[data-curtain-toggle]');
  btn.addEventListener('click', () => {
    state.curtain.open = !state.curtain.open;
    const pct = state.curtain.open ? 100 : 0;
    state.curtain.pct = pct;
    card.querySelector('[data-curtain-fill]').style.width = `${pct}%`;
    card.querySelector('[data-curtain-pct]').textContent = `${pct}%`;
    setStatusPill(card.querySelector('[data-status]'), 'good', state.curtain.open ? '開' : '閉');
    logEvent(`ビニール巻き上げを${state.curtain.open ? '開' : '閉'}にしました（手動）`, 'good');
  });
}

let dataTimer = null;
let clockTimer = null;

function startTimers() {
  dataTimer = setInterval(() => { tickMetrics(); updateNetwork(); updateCo2Gen(); }, 3000);
  clockTimer = setInterval(() => { updateIrrigation(); updateCameraClocks(); }, 1000);
}

function stopTimers() {
  clearInterval(dataTimer);
  clearInterval(clockTimer);
}

function setupPauseButton() {
  const btn = document.getElementById('pauseBtn');
  btn.addEventListener('click', () => {
    state.running = !state.running;
    btn.textContent = state.running ? '一時停止' : '再開する';
    if (state.running) startTimers(); else stopTimers();
  });
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('kact-monitor-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  updateThemeIcon();

  btn.addEventListener('click', () => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = document.documentElement.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kact-monitor-theme', next);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective = document.documentElement.getAttribute('data-theme') || (systemDark ? 'dark' : 'light');
    btn.textContent = effective === 'dark' ? '☀️' : '🌙';
  }
}

let appStarted = false;

function startApp() {
  if (appStarted) return;
  appStarted = true;
  for (const key of Object.keys(METRICS)) cardStatus[key] = classify(state.values[key], METRICS[key]);

  setupCurtainToggle();
  setupPauseButton();
  setupThemeToggle();
  tickMetrics();
  updateNetwork();
  updateCo2Gen();
  updateIrrigation();
  updateCameraClocks();
  logEvent('モニタリングを開始しました', 'good');
  startTimers();
}

const AUTH_KEY = 'kact-monitor-auth';
const AUTH_PASSWORD = 'kact-passion2026';

function setupLoginGate() {
  const gate = document.getElementById('loginGate');
  const appRoot = document.getElementById('appRoot');

  function unlock() {
    gate.hidden = true;
    appRoot.hidden = false;
    startApp();
  }

  if (localStorage.getItem(AUTH_KEY) === 'ok') {
    unlock();
    return;
  }

  const form = document.getElementById('loginForm');
  const input = document.getElementById('loginPassword');
  const error = document.getElementById('loginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === AUTH_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'ok');
      unlock();
    } else {
      error.hidden = false;
      input.value = '';
      input.focus();
    }
  });
}

function setupLogoutButton() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    location.reload();
  });
}

setupLoginGate();
setupLogoutButton();
