# Compass ビジネスサイト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** コンパス社のリード獲得特化型ランディングページを静的HTML/CSS/JSで構築する。

**Architecture:** 1ファイル構成のLP。CSS変数でデザインシステムを管理し、Intersection Observer APIでスクロールアニメーションを実装。フォームはFormspree、LINE連携はURLボタンで対応。

**Tech Stack:** HTML5, CSS3（カスタムプロパティ）, Vanilla JS, Google Fonts（Noto Sans JP）, Formspree

---

## ファイルマップ

| ファイル | 役割 |
|---|---|
| `compass/index.html` | メインLP（全セクション） |
| `compass/css/style.css` | デザインシステム＋全スタイル |
| `compass/js/main.js` | スクロールアニメーション |
| `compass/img/profile.jpg` | 代表写真（プレースホルダー画像で代替） |

---

### Task 1: ディレクトリ構造とベースHTML

**Files:**
- Create: `compass/index.html`
- Create: `compass/css/style.css`
- Create: `compass/js/main.js`
- Create: `compass/img/` (ディレクトリのみ)

- [ ] **Step 1: ディレクトリを作成する**

```bash
mkdir -p compass/css compass/js compass/img
touch compass/css/style.css compass/js/main.js
```

- [ ] **Step 2: index.htmlのベース構造を作成する**

`compass/index.html` に以下を書く：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>コンパス | AIで、経営の羅針盤を。</title>
  <meta name="description" content="地元金融機関で10数年地域課題解決に携わった経験とAI活用の知見で、創業・海外展開・AI活用をワンストップで支援します。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- HERO -->
  <section id="hero"></section>

  <!-- PAIN -->
  <section id="pain"></section>

  <!-- SERVICE -->
  <section id="service"></section>

  <!-- NUMBERS -->
  <section id="numbers"></section>

  <!-- PROFILE -->
  <section id="profile"></section>

  <!-- CTA -->
  <section id="cta"></section>

  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: ブラウザで開いて真っ黒な画面が表示されることを確認する**

```bash
# ターミナルで確認用サーバー起動（node server.jsがある場合）
# またはVS Codeの「Live Server」でcompass/index.htmlを開く
```

- [ ] **Step 4: コミットする**

```bash
git add compass/
git commit -m "feat: scaffold Compass LP directory structure"
```

---

### Task 2: デザインシステム（CSS変数とリセット）

**Files:**
- Modify: `compass/css/style.css`

- [ ] **Step 1: CSS変数とリセットを書く**

`compass/css/style.css` に以下を書く：

```css
:root {
  --bg: #0a0a0f;
  --bg-card: #13131f;
  --accent-start: #4f46e5;
  --accent-end: #7c3aed;
  --accent-gradient: linear-gradient(135deg, var(--accent-start), var(--accent-end));
  --text: #f0f0f0;
  --text-secondary: #94a3b8;
  --radius: 12px;
  --max-width: 1100px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  line-height: 1.7;
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

section {
  padding: 96px 0;
}

h2.section-title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
}

p.section-subtitle {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 56px;
}

.btn {
  display: inline-block;
  padding: 16px 32px;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.85;
}

.btn-primary {
  background: var(--accent-gradient);
  color: #fff;
  border: none;
}

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 2px solid var(--accent-start);
}

/* フェードインアニメーション用 */
.fade-in {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: ブラウザを確認する**

ページを開き、背景が `#0a0a0f` の黒になっていることを確認する。

- [ ] **Step 3: コミットする**

```bash
git add compass/css/style.css
git commit -m "feat: add design system CSS variables and base styles"
```

---

### Task 3: HEROセクション

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: HEROのHTMLを書く**

`compass/index.html` の `<section id="hero"></section>` を以下に置き換える：

```html
  <!-- HERO -->
  <section id="hero">
    <div class="container hero-inner">
      <div class="hero-badge fade-in">AI Business Consulting</div>
      <h1 class="hero-title fade-in">AIで、経営の<br><span class="gradient-text">羅針盤</span>を。</h1>
      <p class="hero-sub fade-in">
        地元金融機関で地域課題解決に10数年携わった経験と<br>
        AI活用の知見で、創業・海外展開・AI活用を<br>
        ワンストップで支援します。
      </p>
      <div class="hero-cta fade-in">
        <a href="https://lin.ee/XXXXXXX" class="btn btn-primary" target="_blank" rel="noopener">
          LINEで無料相談する →
        </a>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: HEROのCSSを追記する**

`compass/css/style.css` の末尾に追記する：

```css
/* ===== HERO ===== */
#hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background:
    radial-gradient(ellipse at 60% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 60%),
    var(--bg);
}

.hero-inner {
  text-align: center;
}

.hero-badge {
  display: inline-block;
  background: rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(79, 70, 229, 0.4);
  color: #a5b4fc;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 32px;
}

.hero-title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 24px;
}

.gradient-text {
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 48px;
  line-height: 1.9;
}

.hero-cta {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
```

- [ ] **Step 3: ブラウザで確認する**

HEROセクションが全画面表示され、グラデーションタイトルと紫のCTAボタンが見えることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add HERO section with gradient title and CTA"
```

---

### Task 4: PAINセクション（課題提起）

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: PAINのHTMLを書く**

`compass/index.html` の `<section id="pain"></section>` を以下に置き換える：

```html
  <!-- PAIN -->
  <section id="pain">
    <div class="container">
      <h2 class="section-title fade-in">こんな悩みを抱えていませんか？</h2>
      <div class="pain-grid">
        <div class="pain-card fade-in">
          <div class="pain-icon">📋</div>
          <p>創業の手続きや資金調達、<br>何から始めればいいか分からない</p>
        </div>
        <div class="pain-card fade-in">
          <div class="pain-icon">🌏</div>
          <p>海外に売りたいが、どの国・<br>どのルートが正解か見えない</p>
        </div>
        <div class="pain-card fade-in">
          <div class="pain-icon">🤖</div>
          <p>AIを使いたいが、自社のどの<br>業務に活かせるか分からない</p>
        </div>
        <div class="pain-card fade-in">
          <div class="pain-icon">💼</div>
          <p>専門家に相談したいが、費用対効果が<br>読めず踏み出せない</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: PAINのCSSを追記する**

```css
/* ===== PAIN ===== */
#pain {
  background: linear-gradient(180deg, var(--bg) 0%, #0d0d1a 100%);
}

.pain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.pain-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 32px 24px;
  text-align: center;
  transition: border-color 0.3s;
}

.pain-card:hover {
  border-color: rgba(79, 70, 229, 0.4);
}

.pain-icon {
  font-size: 36px;
  margin-bottom: 16px;
}

.pain-card p {
  color: var(--text-secondary);
  line-height: 1.8;
}
```

- [ ] **Step 3: ブラウザで確認する**

PAINカードが4枚並んでいることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add PAIN section with 4 problem cards"
```

---

### Task 5: SERVICEセクション（3本柱）

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: SERVICEのHTMLを書く**

`compass/index.html` の `<section id="service"></section>` を以下に置き換える：

```html
  <!-- SERVICE -->
  <section id="service">
    <div class="container">
      <h2 class="section-title fade-in">コンパスの3つの支援</h2>
      <p class="section-subtitle fade-in">あなたのビジネスの課題に合わせて、最適なルートを設計します。</p>
      <div class="service-grid">
        <div class="service-card fade-in">
          <div class="service-icon">🏦</div>
          <h3>創業支援</h3>
          <p>事業計画・資金調達・行政手続きまで、地域金融機関での経験を活かしリスクを見極めながら伴走します。</p>
        </div>
        <div class="service-card fade-in">
          <div class="service-icon">🌏</div>
          <h3>海外販路開拓</h3>
          <p>ターゲット市場の選定から現地パートナー探しまで、実績あるネットワークで最短ルートを設計します。</p>
        </div>
        <div class="service-card fade-in">
          <div class="service-icon">🤖</div>
          <h3>AI活用コンサルティング</h3>
          <p>業務効率化・営業強化・意思決定支援まで、御社に合ったAI導入を設計から実装まで支援します。</p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: SERVICEのCSSを追記する**

```css
/* ===== SERVICE ===== */
#service {
  background: var(--bg);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.service-card {
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius);
  padding: 40px 32px;
  transition: transform 0.3s, border-color 0.3s;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: rgba(79, 70, 229, 0.5);
}

.service-icon {
  font-size: 40px;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.service-card p {
  color: var(--text-secondary);
  line-height: 1.8;
}
```

- [ ] **Step 3: ブラウザで確認する**

サービスカードが3枚横並びになり、ホバーで浮き上がることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add SERVICE section with 3 pillars"
```

---

### Task 6: NUMBERSセクション（実績数字）

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: NUMBERSのHTMLを書く**

`compass/index.html` の `<section id="numbers"></section>` を以下に置き換える：

```html
  <!-- NUMBERS -->
  <section id="numbers">
    <div class="container">
      <div class="numbers-grid">
        <div class="number-item fade-in">
          <div class="number-value">50<span class="number-plus">+</span></div>
          <div class="number-label">支援企業数</div>
        </div>
        <div class="number-item fade-in">
          <div class="number-value">30<span class="number-plus">+</span></div>
          <div class="number-label">海外案件数</div>
        </div>
        <div class="number-item fade-in">
          <div class="number-value">95<span class="number-plus">%</span></div>
          <div class="number-label">顧客継続率</div>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: NUMBERSのCSSを追記する**

```css
/* ===== NUMBERS ===== */
#numbers {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
  border-top: 1px solid rgba(79, 70, 229, 0.2);
  border-bottom: 1px solid rgba(79, 70, 229, 0.2);
  padding: 72px 0;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  text-align: center;
}

.number-value {
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 900;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 12px;
}

.number-plus {
  font-size: 0.6em;
}

.number-label {
  color: var(--text-secondary);
  font-size: 15px;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 3: ブラウザで確認する**

数字が大きくグラデーション表示されていることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add NUMBERS section with key metrics"
```

---

### Task 7: PROFILEセクション（代表プロフィール）

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: プレースホルダー画像を作成する**

代表写真が用意されるまでの仮画像を用意する：

```bash
# CSSでプレースホルダーを作るため画像ファイルは不要（Step 2のCSSで対応）
```

- [ ] **Step 2: PROFILEのHTMLを書く**

`compass/index.html` の `<section id="profile"></section>` を以下に置き換える：

```html
  <!-- PROFILE -->
  <section id="profile">
    <div class="container">
      <div class="profile-inner">
        <div class="profile-image-wrap fade-in">
          <div class="profile-image">
            <!-- 代表写真：img/profile.jpg に差し替え -->
            <img src="img/profile.jpg" alt="代表プロフィール写真"
                 onerror="this.style.display='none'; this.parentElement.classList.add('no-photo')">
          </div>
        </div>
        <div class="profile-content fade-in">
          <div class="profile-badge">代表プロフィール</div>
          <h2 class="profile-name">代表　○○ ○○</h2>
          <p class="profile-text">
            地元金融機関の地域課題解決部門で10数年、地域の中小企業・起業家と向き合い続けてきました。
          </p>
          <p class="profile-text">
            資金・販路・人材——地域が抱えるリアルな課題を現場で見てきた経験と、
            AI活用の知見を掛け合わせ、「次の一手」を共に考えるコンサルタントとして独立しました。
          </p>
          <p class="profile-text profile-quote">
            地域から世界へ。コンパスは、あなたのビジネスの進むべき方向を示す羅針盤でありたいと思っています。
          </p>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: PROFILEのCSSを追記する**

```css
/* ===== PROFILE ===== */
#profile {
  background: #0d0d1a;
}

.profile-inner {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 64px;
  align-items: center;
}

.profile-image {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid rgba(79, 70, 229, 0.3);
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image.no-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
}

.profile-image.no-photo::after {
  content: "👤";
}

.profile-badge {
  display: inline-block;
  background: rgba(79, 70, 229, 0.2);
  border: 1px solid rgba(79, 70, 229, 0.4);
  color: #a5b4fc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 20px;
}

.profile-name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
}

.profile-text {
  color: var(--text-secondary);
  line-height: 1.9;
  margin-bottom: 16px;
}

.profile-quote {
  color: var(--text);
  font-weight: 700;
  border-left: 3px solid var(--accent-start);
  padding-left: 16px;
  margin-top: 24px;
}
```

- [ ] **Step 4: ブラウザで確認する**

写真エリア（またはプレースホルダーアイコン）と経歴テキストが左右に並んでいることを確認する。

- [ ] **Step 5: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add PROFILE section with placeholder image support"
```

---

### Task 8: CTAセクション（問い合わせ）とフッター

**Files:**
- Modify: `compass/index.html`
- Modify: `compass/css/style.css`

- [ ] **Step 1: CTAのHTMLを書く**

`compass/index.html` の `<section id="cta"></section>` を以下に置き換える。その後に `<footer>` も追加する：

```html
  <!-- CTA -->
  <section id="cta">
    <div class="container">
      <div class="cta-box fade-in">
        <h2 class="cta-title">まずは無料でご相談ください</h2>
        <p class="cta-sub">LINEで気軽に質問するだけでも構いません。<br>一緒に、あなたのビジネスの次の一手を考えましょう。</p>
        <div class="cta-buttons">
          <a href="https://lin.ee/XXXXXXX" class="btn btn-primary" target="_blank" rel="noopener">
            LINE公式で相談する
          </a>
          <a href="#contact-form" class="btn btn-secondary">メールフォームへ</a>
        </div>
      </div>

      <!-- メールフォーム -->
      <div id="contact-form" class="contact-form-wrap fade-in">
        <h3 class="form-title">メールでのお問い合わせ</h3>
        <form action="https://formspree.io/f/XXXXXXXX" method="POST" class="contact-form">
          <div class="form-group">
            <label for="name">お名前 <span class="required">*</span></label>
            <input type="text" id="name" name="name" required placeholder="山田 太郎">
          </div>
          <div class="form-group">
            <label for="company">会社名</label>
            <input type="text" id="company" name="company" placeholder="株式会社〇〇">
          </div>
          <div class="form-group">
            <label for="email">メールアドレス <span class="required">*</span></label>
            <input type="email" id="email" name="email" required placeholder="example@company.co.jp">
          </div>
          <div class="form-group">
            <label for="message">ご相談内容 <span class="required">*</span></label>
            <textarea id="message" name="message" required rows="5" placeholder="創業支援について相談したい、など"></textarea>
          </div>
          <button type="submit" class="btn btn-primary form-submit">送信する</button>
        </form>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-inner">
        <div class="footer-logo">COMPASS</div>
        <p class="footer-copy">© 2026 コンパス. All rights reserved.</p>
      </div>
    </div>
  </footer>
```

- [ ] **Step 2: CTAとフッターのCSSを追記する**

```css
/* ===== CTA ===== */
#cta {
  background: var(--bg);
}

.cta-box {
  text-align: center;
  margin-bottom: 80px;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-sub {
  color: var(--text-secondary);
  margin-bottom: 40px;
  line-height: 1.9;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* フォーム */
.contact-form-wrap {
  max-width: 640px;
  margin: 0 auto;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.required {
  color: #f87171;
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: var(--text);
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  padding: 14px 16px;
  transition: border-color 0.2s;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-start);
}

.form-group textarea {
  resize: vertical;
}

.form-submit {
  width: 100%;
  font-size: 17px;
  padding: 18px;
}

/* フッター */
footer {
  background: #070710;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 40px 0;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-logo {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.2em;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-copy {
  color: var(--text-secondary);
  font-size: 13px;
}
```

- [ ] **Step 3: ブラウザで確認する**

CTAボタンとフォームが表示され、フォームの入力欄がフォーカス時に紫色になることを確認する。

- [ ] **Step 4: コミットする**

```bash
git add compass/index.html compass/css/style.css
git commit -m "feat: add CTA section with LINE button, contact form, and footer"
```

---

### Task 9: スクロールアニメーション

**Files:**
- Modify: `compass/js/main.js`

- [ ] **Step 1: Intersection Observerでフェードインを実装する**

`compass/js/main.js` に以下を書く：

```js
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  targets.forEach((el) => observer.observe(el));
});
```

- [ ] **Step 2: ブラウザで確認する**

ページをスクロールし、各セクションの要素がフェードインしながら現れることを確認する。

- [ ] **Step 3: コミットする**

```bash
git add compass/js/main.js
git commit -m "feat: add scroll fade-in animation via IntersectionObserver"
```

---

### Task 10: レスポンシブ対応

**Files:**
- Modify: `compass/css/style.css`

- [ ] **Step 1: モバイル用メディアクエリを追記する**

`compass/css/style.css` の末尾に追記する：

```css
/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  section {
    padding: 64px 0;
  }

  h2.section-title {
    font-size: 26px;
  }

  .numbers-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .profile-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .profile-image-wrap {
    max-width: 240px;
    margin: 0 auto;
  }

  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-sub {
    font-size: 15px;
  }

  .numbers-grid {
    grid-template-columns: 1fr;
  }

  .pain-grid {
    grid-template-columns: 1fr;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}
```

- [ ] **Step 2: ブラウザのDevToolsでモバイル表示を確認する**

Chrome DevToolsで iPhone SE（375px）と iPad（768px）の表示を確認し、崩れがないことを確認する。

- [ ] **Step 3: コミットする**

```bash
git add compass/css/style.css
git commit -m "feat: add responsive styles for mobile and tablet"
```

---

### Task 11: LINE URLとFormspreeの差し替え（設定値の最終確認）

**Files:**
- Modify: `compass/index.html`

- [ ] **Step 1: LINE公式URLを差し替える**

`compass/index.html` 内の `https://lin.ee/XXXXXXX` を実際のLINE公式アカウントURLに変更する（2箇所）。

- [ ] **Step 2: FormspreeのエンドポイントIDを差し替える**

`https://formspree.io/f/XXXXXXXX` の `XXXXXXXX` を、[formspree.io](https://formspree.io) で取得した実際のフォームIDに変更する。

- [ ] **Step 3: 代表名を差し替える**

`○○ ○○` を実際の代表氏名に変更する。

- [ ] **Step 4: 代表写真を配置する**

`compass/img/profile.jpg` に実際の写真ファイルを配置する。

- [ ] **Step 5: フォームの動作確認をする**

フォームにテストデータを入力して送信し、Formspreeの管理画面またはメールで受信を確認する。

- [ ] **Step 6: 最終コミットをする**

```bash
git add compass/
git commit -m "feat: complete Compass LP - configure LINE, Formspree, and profile"
```

---

## 未確定事項（実装前に確認）

- [ ] 代表写真（`compass/img/profile.jpg`）
- [ ] NUMBERS の実際の数値（支援企業数・海外案件数・顧客継続率）
- [ ] LINE公式アカウントのURL（`https://lin.ee/XXXXXXX`）
- [ ] FormspreeのフォームエンドポイントID
- [ ] 代表氏名（`○○ ○○` の部分）
