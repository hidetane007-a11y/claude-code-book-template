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

  const resp = await fetch(url);
  if (!resp.ok) throw new Error('API fetch failed: ' + resp.status);
  const data = await resp.json();

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

// Node.js test support (browser ignores this)
if (typeof module !== 'undefined') {
  module.exports = { classifyWeather, worstWeather, calcForecast, DEFAULT_COEFFICIENTS };
}
