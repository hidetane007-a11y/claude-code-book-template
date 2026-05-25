# 天気連動売上予測アプリ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 鹿児島市ランチ定食屋向けに、Open-Meteo APIの11〜14時天気予報から予測客数・売上を表示するスマホ対応Webアプリを作る。

**Architecture:** 静的HTML/JSの3ファイル構成（index.html・settings.html・app.js）。app.jsに全ロジックを集約し両HTMLから読み込む。天気はOpen-Meteo APIから取得、係数はlocalStorageに保存する。

**Tech Stack:** 素のHTML/CSS/JavaScript（ES6+）、Open-Meteo API（無料・APIキー不要）、localStorage

---

## ファイル構成

```
weather-forecast/
├── index.html     # メイン予測画面
├── settings.html  # 係数設定画面
├── app.js         # 全ロジック（定数・純粋関数・API・localStorage）
└── test.js        # Node.js で動く純粋関数テスト
```

---

## Task 1: app.js 純粋関数 + テスト（TDD）

**Files:**
- Create: `weather-forecast/app.js`
- Create: `weather-forecast/test.js`

- [ ] **Step 1: test.js を書く（失敗するはず）**

`weather-forecast/test.js` を作成:

```javascript
const { classifyWeather, worstWeather, calcForecast, DEFAULT_COEFFICIENTS } = require('./app.js');

function assert(cond, msg) {
  console.log((cond ? 'PASS' : 'FAIL') + ': ' + msg);
  if (!cond) process.exitCode = 1;
}

// classifyWeather
assert(classifyWeather(0) === 'sunny',  'code 0 → sunny');
assert(classifyWeather(1) === 'sunny',  'code 1 → sunny');
assert(classifyWeather(2) === 'cloudy', 'code 2 → cloudy');
assert(classifyWeather(3) === 'cloudy', 'code 3 → cloudy');
assert(classifyWeather(45) === 'cloudy','code 45 → cloudy');
assert(classifyWeather(48) === 'cloudy','code 48 → cloudy');
assert(classifyWeather(51) === 'rainy', 'code 51 → rainy');
assert(classifyWeather(67) === 'rainy', 'code 67 → rainy');
assert(classifyWeather(80) === 'rainy', 'code 80 → rainy');
assert(classifyWeather(82) === 'rainy', 'code 82 → rainy');
assert(classifyWeather(71) === 'stormy','code 71 → stormy');
assert(classifyWeather(77) === 'stormy','code 77 → stormy');
assert(classifyWeather(95) === 'stormy','code 95 → stormy');
assert(classifyWeather(99) === 'stormy','code 99 → stormy');

// worstWeather
assert(worstWeather([0, 1, 0])   === 'sunny',  'all sunny → sunny');
assert(worstWeather([0, 2, 3])   === 'cloudy', 'mix with cloudy → cloudy');
assert(worstWeather([0, 61, 2])  === 'rainy',  'mix with rainy → rainy');
assert(worstWeather([82, 95, 51]) === 'stormy', 'mix with stormy → stormy');

// calcForecast
const coef = DEFAULT_COEFFICIENTS;
assert(calcForecast('sunny',  coef).customers === 25,    'sunny: 25 customers');
assert(calcForecast('sunny',  coef).sales     === 17500, 'sunny: ¥17,500');
assert(calcForecast('cloudy', coef).customers === 15,    'cloudy: 15 customers');
assert(calcForecast('rainy',  coef).customers === 8,     'rainy: 8 customers');
assert(calcForecast('rainy',  coef).sales     === 5600,  'rainy: ¥5,600');
assert(calcForecast('stormy', coef).customers === 0,     'stormy: 0 customers');
assert(calcForecast('stormy', coef).sales     === 0,     'stormy: ¥0');

console.log('\nDone.');
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
cd weather-forecast && node test.js
```

期待出力: `Error: Cannot find module './app.js'`

- [ ] **Step 3: app.js を実装する**

`weather-forecast/app.js` を作成:

```javascript
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
```

- [ ] **Step 4: テストが通ることを確認する**

```bash
node test.js
```

期待出力（全行 PASS）:
```
PASS: code 0 → sunny
PASS: code 1 → sunny
...
PASS: stormy: ¥0

Done.
```

- [ ] **Step 5: コミット**

```bash
git add weather-forecast/app.js weather-forecast/test.js
git commit -m "feat: add app.js core logic with tests"
```

---

## Task 2: index.html — HTML・CSS・JS

**Files:**
- Create: `weather-forecast/index.html`

- [ ] **Step 1: index.html を作成する**

`weather-forecast/index.html` を作成:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>定食屋 売上予測</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif;
      background: #f0f4f0;
      min-height: 100vh;
    }
    .container { max-width: 390px; margin: 0 auto; }

    header {
      background: #2c5f2e;
      color: white;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .app-title { font-weight: bold; font-size: 16px; }
    .settings-btn {
      font-size: 22px;
      text-decoration: none;
      line-height: 1;
    }

    main { padding: 16px; }

    .loading, .error {
      text-align: center;
      padding: 48px 16px;
      color: #666;
      font-size: 15px;
    }
    .error { color: #c62828; }
    .hidden { display: none; }

    .date-section {
      text-align: center;
      margin-bottom: 12px;
    }
    .date-text { font-size: 14px; color: #555; }
    .lunch-label { font-size: 12px; color: #888; margin-top: 2px; }

    .weather-section {
      text-align: center;
      padding: 8px 0 12px;
    }
    .weather-icon { font-size: 60px; line-height: 1; }
    .weather-name { font-size: 18px; font-weight: bold; color: #333; margin-top: 4px; }
    .weather-detail { font-size: 13px; color: #888; margin-top: 4px; }

    .forecast-card {
      background: white;
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      margin-bottom: 12px;
    }
    .forecast-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .forecast-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }
    .forecast-row + .forecast-row { margin-top: 8px; }
    .forecast-title { font-size: 14px; color: #555; }
    .forecast-value { font-size: 24px; font-weight: bold; color: #2c5f2e; }

    .tomorrow-card {
      background: #e8f5e9;
      border-radius: 14px;
      padding: 12px 16px;
      margin-bottom: 12px;
    }
    .tomorrow-label { font-size: 11px; color: #888; margin-bottom: 6px; }
    .tomorrow-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tomorrow-weather { font-size: 15px; }
    .tomorrow-value { font-size: 15px; font-weight: bold; color: #2c5f2e; }

    .updated-at {
      text-align: center;
      font-size: 11px;
      color: #bbb;
      margin-top: 8px;
    }

    .first-run-notice {
      background: #fff8e1;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #6d4c00;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .first-run-notice a { color: #2c5f2e; font-weight: bold; white-space: nowrap; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="app-title">🍱 定食屋 売上予測</span>
      <a href="settings.html" class="settings-btn">⚙️</a>
    </header>
    <main>
      <div id="loading" class="loading">天気情報を取得中...</div>
      <div id="error"   class="error hidden"></div>
      <div id="content" class="hidden">
        <div id="first-run" class="first-run-notice hidden">
          💡 初期値のままです <a href="settings.html">係数を設定する →</a>
        </div>
        <div class="date-section">
          <div id="date-text"   class="date-text"></div>
          <div class="lunch-label">ランチタイム 11:00〜14:00</div>
        </div>
        <div class="weather-section">
          <div id="weather-icon"   class="weather-icon"></div>
          <div id="weather-name"   class="weather-name"></div>
          <div id="weather-detail" class="weather-detail"></div>
        </div>
        <div class="forecast-card">
          <div class="forecast-label">本日の予測</div>
          <div class="forecast-row">
            <span class="forecast-title">👥 予測客数</span>
            <span id="today-customers" class="forecast-value"></span>
          </div>
          <div class="forecast-row">
            <span class="forecast-title">💴 予測売上</span>
            <span id="today-sales" class="forecast-value"></span>
          </div>
        </div>
        <div id="tomorrow-section" class="tomorrow-card hidden">
          <div class="tomorrow-label">明日の予測</div>
          <div class="tomorrow-row">
            <span id="tomorrow-weather" class="tomorrow-weather"></span>
            <span id="tomorrow-value"   class="tomorrow-value"></span>
          </div>
        </div>
        <div id="updated-at" class="updated-at"></div>
      </div>
    </main>
  </div>

  <script src="app.js"></script>
  <script>
    (async () => {
      const loading = document.getElementById('loading');
      const errorEl = document.getElementById('error');
      const content = document.getElementById('content');

      try {
        const [weather, coefficients] = await Promise.all([
          fetchWeather(),
          Promise.resolve(loadCoefficients())
        ]);

        const todayForecast = calcForecast(weather.today.weatherType, coefficients);

        document.getElementById('date-text').textContent =
          formatDisplayDate(getJSTDateStr(0));
        document.getElementById('weather-icon').textContent =
          WEATHER_ICONS[weather.today.weatherType];
        document.getElementById('weather-name').textContent =
          WEATHER_NAMES[weather.today.weatherType];
        document.getElementById('weather-detail').textContent =
          `降水確率 ${weather.today.precipitation}%・気温 ${weather.today.temp}℃`;
        document.getElementById('today-customers').textContent =
          `${todayForecast.customers} 人`;
        document.getElementById('today-sales').textContent =
          `¥${todayForecast.sales.toLocaleString()}`;

        if (weather.tomorrow) {
          const tmForecast = calcForecast(weather.tomorrow.weatherType, coefficients);
          document.getElementById('tomorrow-weather').textContent =
            `${WEATHER_ICONS[weather.tomorrow.weatherType]} ${WEATHER_NAMES[weather.tomorrow.weatherType]}`;
          document.getElementById('tomorrow-value').textContent =
            `${tmForecast.customers}人 / ¥${tmForecast.sales.toLocaleString()}`;
          document.getElementById('tomorrow-section').classList.remove('hidden');
        }

        document.getElementById('updated-at').textContent =
          '最終更新 ' + new Date().toLocaleTimeString('ja-JP',
            { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' });

        if (!localStorage.getItem(STORAGE_KEY)) {
          document.getElementById('first-run').classList.remove('hidden');
        }

        loading.classList.add('hidden');
        content.classList.remove('hidden');

      } catch (err) {
        loading.classList.add('hidden');
        errorEl.textContent = '天気情報を取得できませんでした。通信状況を確認してください。';
        errorEl.classList.remove('hidden');
      }
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: ブラウザで動作確認する**

`weather-forecast/index.html` をブラウザで直接開く（`file://` でOK）。

確認項目:
- 天気アイコン・名前・降水確率・気温が表示される
- 予測客数・売上が表示される
- 明日の予測が表示される
- 初回は「係数を設定する」バナーが表示される

- [ ] **Step 3: コミット**

```bash
git add weather-forecast/index.html
git commit -m "feat: add index.html main forecast screen"
```

---

## Task 3: settings.html — 係数設定画面

**Files:**
- Create: `weather-forecast/settings.html`

- [ ] **Step 1: settings.html を作成する**

`weather-forecast/settings.html` を作成:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>係数設定</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif;
      background: #f0f4f0;
      min-height: 100vh;
    }
    .container { max-width: 390px; margin: 0 auto; }

    header {
      background: #2c5f2e;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      position: sticky;
      top: 0;
    }
    .back-btn {
      color: white;
      text-decoration: none;
      font-size: 20px;
      line-height: 1;
    }
    .page-title { font-weight: bold; font-size: 16px; }

    main { padding: 16px; }

    .notice {
      background: #fff8e1;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #6d4c00;
      margin-bottom: 16px;
    }

    .section-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .settings-card {
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      margin-bottom: 20px;
    }
    .setting-row {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .setting-row:last-child { border-bottom: none; }

    .weather-label {
      font-size: 15px;
      margin-bottom: 8px;
    }
    .inputs {
      display: flex;
      gap: 10px;
    }
    .input-group { flex: 1; }
    .input-group input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 15px;
      color: #333;
    }
    .input-group input:focus {
      outline: none;
      border-color: #2c5f2e;
    }
    .input-hint {
      font-size: 11px;
      color: #aaa;
      margin-top: 4px;
    }

    .save-btn {
      width: 100%;
      padding: 14px;
      background: #2c5f2e;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    }
    .save-btn:active { background: #1a3d1c; }

    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="index.html" class="back-btn">←</a>
      <span class="page-title">天気別 係数設定</span>
    </header>
    <main>
      <div class="notice">
        💡 天気ごとの <strong>平均客数</strong> と <strong>客単価</strong> を入力すると予測が計算されます
      </div>

      <div class="section-label">天気別 平均客数・客単価</div>
      <div class="settings-card">
        <div class="setting-row">
          <div class="weather-label">☀️ 晴れ</div>
          <div class="inputs">
            <div class="input-group">
              <input type="number" id="sunny-customers" min="0" placeholder="0">
              <div class="input-hint">客数（人）</div>
            </div>
            <div class="input-group">
              <input type="number" id="sunny-price" min="0" placeholder="0">
              <div class="input-hint">客単価（円）</div>
            </div>
          </div>
        </div>
        <div class="setting-row">
          <div class="weather-label">☁️ 曇り</div>
          <div class="inputs">
            <div class="input-group">
              <input type="number" id="cloudy-customers" min="0" placeholder="0">
              <div class="input-hint">客数（人）</div>
            </div>
            <div class="input-group">
              <input type="number" id="cloudy-price" min="0" placeholder="0">
              <div class="input-hint">客単価（円）</div>
            </div>
          </div>
        </div>
        <div class="setting-row">
          <div class="weather-label">🌧️ 雨</div>
          <div class="inputs">
            <div class="input-group">
              <input type="number" id="rainy-customers" min="0" placeholder="0">
              <div class="input-hint">客数（人）</div>
            </div>
            <div class="input-group">
              <input type="number" id="rainy-price" min="0" placeholder="0">
              <div class="input-hint">客単価（円）</div>
            </div>
          </div>
        </div>
        <div class="setting-row">
          <div class="weather-label">⛈️ 大雨・嵐</div>
          <div class="inputs">
            <div class="input-group">
              <input type="number" id="stormy-customers" min="0" placeholder="0">
              <div class="input-hint">客数（人）</div>
            </div>
            <div class="input-group">
              <input type="number" id="stormy-price" min="0" placeholder="0">
              <div class="input-hint">客単価（円）</div>
            </div>
          </div>
        </div>
      </div>

      <button class="save-btn" onclick="handleSave()">保存する</button>
    </main>
  </div>

  <div id="toast" class="toast">保存しました ✓</div>

  <script src="app.js"></script>
  <script>
    const FIELDS = [
      ['sunny',  'sunny-customers',  'sunny-price'],
      ['cloudy', 'cloudy-customers', 'cloudy-price'],
      ['rainy',  'rainy-customers',  'rainy-price'],
      ['stormy', 'stormy-customers', 'stormy-price'],
    ];

    // フォームに現在の係数を読み込む
    const current = loadCoefficients();
    FIELDS.forEach(([key, custId, priceId]) => {
      document.getElementById(custId).value  = current[key].customers;
      document.getElementById(priceId).value = current[key].unit_price;
    });

    function handleSave() {
      const data = {};
      FIELDS.forEach(([key, custId, priceId]) => {
        data[key] = {
          customers:  Math.max(0, parseInt(document.getElementById(custId).value)  || 0),
          unit_price: Math.max(0, parseInt(document.getElementById(priceId).value) || 0)
        };
      });
      saveCoefficients(data);

      // トースト表示後 index.html に戻る
      const toast = document.getElementById('toast');
      toast.classList.add('show');
      setTimeout(() => { window.location.href = 'index.html'; }, 900);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: 動作確認する**

`index.html` から ⚙️ をタップして `settings.html` に遷移することを確認する。

確認項目:
- フォームに現在の係数（デフォルト値）が表示される
- 値を変更して「保存する」を押すと `index.html` に戻る
- `index.html` で更新された予測値が表示される
- ブラウザの開発者ツール → Application → localStorage に `teishoku_coefficients` が保存されていることを確認

- [ ] **Step 3: コミット**

```bash
git add weather-forecast/settings.html
git commit -m "feat: add settings.html coefficient input screen"
```

---

## Task 4: 統合確認・最終コミット

**Files:**
- No new files

- [ ] **Step 1: 通しで動作確認する**

1. `weather-forecast/index.html` をブラウザで開く
2. 天気・予測が正常に表示されることを確認
3. ⚙️ → 設定画面で係数を変更 → 保存 → 予測値が変わることを確認
4. ブラウザをオフライン（DevTools → Network → Offline）にして `index.html` を再読み込み
   → 「天気情報を取得できませんでした」エラーが表示されることを確認

- [ ] **Step 2: ユニットテストを再確認する**

```bash
cd weather-forecast && node test.js
```

期待出力: 全行 `PASS`、最後に `Done.`

- [ ] **Step 3: 最終コミット**

```bash
git add weather-forecast/
git commit -m "feat: complete weather-sales forecast app v1"
```
