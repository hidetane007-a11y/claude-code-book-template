const DEFAULT_COEFFICIENTS = {
  sunny:  { customers: 25, unit_price: 700 },
  cloudy: { customers: 15, unit_price: 700 },
  rainy:  { customers: 8,  unit_price: 700 },
  stormy: { customers: 0,  unit_price: 700 }
};

const STORAGE_KEY = 'teishoku_coefficients';

const WEATHER_ICONS = {
  sunny:  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.1em"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  cloudy: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.1em"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rainy:  `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.1em"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  stormy: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.1em"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" stroke="#6b7280"/><path d="m13 12-3 5h4l-3 5" stroke="#f59e0b"/></svg>`
};
const WEATHER_NAMES  = { sunny: '晴れ', cloudy: '曇り', rainy: '雨', stormy: '大雨・嵐' };
const WEATHER_SEVERITY = { sunny: 0, cloudy: 1, rainy: 2, stormy: 3 };

function classifyWeather(code) {
  if (code <= 1) return 'sunny';
  if (code <= 3 || code === 45 || code === 48) return 'cloudy';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  return 'stormy';
}

// wttr.in weather codes (WorldWeatherOnline format)
function classifyWttrWeather(code) {
  if (code === 113) return 'sunny';
  if ([200, 386, 389, 392, 395].includes(code)) return 'stormy';
  if ([116, 119, 122, 143, 248, 260].includes(code)) return 'cloudy';
  return 'rainy';
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
  const url = 'https://wttr.in/31.5969,130.5571?format=j1';

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

  if (!data.weather || data.weather.length < 2) throw new Error('Invalid API response');

  function getLunchData(dayData) {
    const lunch = dayData.hourly.find(h => h.time === '1200');
    if (!lunch) return null;
    return {
      weatherType:   classifyWttrWeather(parseInt(lunch.weatherCode)),
      precipitation: parseInt(lunch.chanceofrain),
      temp:          parseInt(lunch.tempC)
    };
  }

  return {
    today:    getLunchData(data.weather[0]),
    tomorrow: getLunchData(data.weather[1])
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
