const DEFAULT_COEFFICIENTS = {
  sunny:  { customers: 25, unit_price: 700 },
  cloudy: { customers: 15, unit_price: 700 },
  rainy:  { customers: 8,  unit_price: 700 },
  stormy: { customers: 0,  unit_price: 700 }
};

const STORAGE_KEY = 'teishoku_coefficients';

const WEATHER_ICONS  = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', stormy: '⛈️' };
const WEATHER_NAMES  = { sunny: '晴れ', cloudy: '曇り', rainy: '雨', stormy: '大雨・嵐' };
const WEATHER_SEVERITY = { sunny: 0, cloudy: 1, rainy: 2, stormy: 3 };

function classifyWeather(code) {
  if (code <= 1) return 'sunny';
  if (code <= 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  return 'stormy';
}

function worstWeather(codes) {
  return codes.map(classifyWeather).reduce(
    (worst, type) => WEATHER_SEVERITY[type] > WEATHER_SEVERITY[worst] ? type : worst,
    'sunny'
  );
}

function calcForecast(weatherType, coefficients) {
  const c = coefficients[weatherType];
  if (!c) throw new Error(`Unknown weatherType: ${weatherType}`);
  return { customers: c.customers, sales: c.customers * c.unit_price };
}

function loadCoefficients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_COEFFICIENTS };
  } catch {
    return { ...DEFAULT_COEFFICIENTS };
  }
}

function saveCoefficients(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getJSTDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}

function formatDisplayDate(jstDateStr) {
  return new Date(jstDateStr + 'T12:00:00+09:00').toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  });
}

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=31.5969&longitude=130.5571'
    + '&hourly=weathercode,precipitation_probability,temperature_2m'
    + '&timezone=Asia%2FTokyo'
    + '&forecast_days=2';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let resp;
  try {
    resp = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!resp.ok) throw new Error('API fetch failed: ' + resp.status);
  const data = await resp.json();

  if (!data.hourly || !data.hourly.time) throw new Error('Invalid API response');
  const times = data.hourly.time;
  const codes = data.hourly.weathercode || data.hourly.weather_code;
  const precip = data.hourly.precipitation_probability;
  const temps  = data.hourly.temperature_2m;

  function getLunchData(dateStr) {
    const indices = ['11:00', '12:00', '13:00']
      .map(h => times.findIndex(t => t === `${dateStr}T${h}`))
      .filter(i => i !== -1);
    if (indices.length === 0) return null;
    return {
      weatherType:   worstWeather(indices.map(i => codes[i])),
      precipitation: Math.max(...indices.map(i => precip[i])),
      temp: Math.round(indices.map(i => temps[i]).reduce((a, b) => a + b, 0) / indices.length)
    };
  }

  return {
    today:    getLunchData(getJSTDateStr(0)),
    tomorrow: getLunchData(getJSTDateStr(1))
  };
}

const HISTORY_KEY = 'teishoku_history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(records) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

function upsertRecord(record) {
  const history = loadHistory();
  const idx = history.findIndex(r => r.date === record.date);
  if (idx >= 0) {
    history[idx] = record;
  } else {
    history.push(record);
  }
  history.sort((a, b) => a.date.localeCompare(b.date));
  saveHistory(history);
}

async function fetchWeatherForDate(dateStr) {
  const today    = getJSTDateStr(0);
  const tomorrow = getJSTDateStr(1);

  if (dateStr === today || dateStr === tomorrow) {
    const weather = await fetchWeather();
    return dateStr === today ? weather.today : weather.tomorrow;
  }

  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=31.5969&longitude=130.5571`
    + `&start_date=${dateStr}&end_date=${dateStr}`
    + `&hourly=weathercode`
    + `&timezone=Asia%2FTokyo`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  let resp;
  try {
    resp = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!resp.ok) throw new Error('Archive API fetch failed: ' + resp.status);
  const data = await resp.json();

  const times = data.hourly.time;
  const codes = data.hourly.weathercode || data.hourly.weather_code;
  const lunchIndices = ['11:00', '12:00', '13:00']
    .map(h => times.findIndex(t => t === `${dateStr}T${h}`))
    .filter(i => i !== -1);

  if (lunchIndices.length === 0) return null;
  return { weatherType: worstWeather(lunchIndices.map(i => codes[i])) };
}

// 複数日の天気を一括取得（start〜end の範囲を1リクエストで）
async function fetchWeatherRange(startDate, endDate) {
  const url = 'https://archive-api.open-meteo.com/v1/archive'
    + `?latitude=31.5969&longitude=130.5571`
    + `&start_date=${startDate}&end_date=${endDate}`
    + `&hourly=weathercode`
    + `&timezone=Asia%2FTokyo`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let resp;
  try {
    resp = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  if (!resp.ok) throw new Error('Archive API fetch failed: ' + resp.status);
  const data = await resp.json();

  const times = data.hourly.time;
  const codes = data.hourly.weathercode || data.hourly.weather_code;

  // 日付 → 天気タイプ のマップを返す
  const result = {};
  const dateSet = new Set();
  times.forEach(t => dateSet.add(t.slice(0, 10)));
  dateSet.forEach(dateStr => {
    const lunchIndices = ['11:00', '12:00', '13:00']
      .map(h => times.findIndex(t => t === `${dateStr}T${h}`))
      .filter(i => i !== -1);
    if (lunchIndices.length > 0) {
      result[dateStr] = worstWeather(lunchIndices.map(i => codes[i]));
    }
  });
  return result;
}

// Node.js test support (browser ignores this)
if (typeof module !== 'undefined') {
  module.exports = { classifyWeather, worstWeather, calcForecast, DEFAULT_COEFFICIENTS,
    loadHistory, saveHistory, upsertRecord };
}
