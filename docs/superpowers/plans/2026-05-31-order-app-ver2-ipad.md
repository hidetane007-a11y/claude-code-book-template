# 注文管理アプリ VER2 — iPad Air 2 最適化プラン

作成日: 2026-05-31  
対象デバイス: iPad Air 2（9.7インチ / iOS 15 / Safari）  
参照元: `/workspaces/claude-code-book-template/注文アプリ/`  
出力先（予定）: `/workspaces/claude-code-book-template/注文アプリv2/`

---

## 背景と目的

現在の注文アプリはスマートフォン向けに最適化されており、iPad Air 2 で使用すると以下の問題がある：

- 管理画面（admin.html）の横スクロールが必要なテーブルレイアウト
- カートがサイドバー型（スマホ向け）で iPad の大画面を活かせない
- タップ対象のボタンが小さく（指操作に不向き）
- iOS Safari でフォーム入力時に自動ズームが発生する
- hover 前提の UI 要素が touchonly デバイスで反応しない

VER2 では iPad Air 2 の画面サイズ・タッチ操作・Safari の制約を正面から解決し、  
**スタッフが厨房・カウンターで1台の iPad を使って全操作できる**アプリに改良する。

---

## iPad Air 2 デバイス仕様（制約整理）

| 項目 | 仕様 |
|------|------|
| 画面サイズ | 9.7インチ（CSS: 768×1024px、portrait基準） |
| Landscape | 1024×768px |
| ブラウザ | Safari（WebKit / iOS 15.8） |
| タッチ | マルチタッチ、hover なし |
| Apple HIG 最小タッチ目標 | 44×44px（推奨 48×48px） |
| input ズーム | font-size < 16px でピンチズームが発動 |
| PWA ServiceWorker | iOS 15 では制限あり（バックグラウンドプッシュ不可） |
| RAM | 2GB（重いアニメーション・大量 DOM は避ける） |

---

## ファイル構成（VER2）

```
注文アプリv2/
├── index.html        # 顧客用注文ページ（iPad最適化）
├── admin.html        # 管理画面（iPad最適化）
├── css/
│   ├── style.css     # 共通スタイル（VER1からリファクタ）
│   ├── order.css     # 注文ページ専用
│   └── admin.css     # 管理画面専用
└── js/
    ├── config.js     # Supabase 設定（VER1と同じ）
    ├── data.js       # データ操作（VER1と同じ）
    ├── app.js        # 注文ページロジック（VER2向け改修）
    ├── admin.js      # 管理画面ロジック（VER2向け改修）
    ├── ai-import.js  # AI解析（VER1と同じ）
    └── gmail.js      # Gmail連携（VER1と同じ）
```

`config.js` / `data.js` / `ai-import.js` / `gmail.js` は VER1 から変更なし。  
HTML・CSS・`app.js`・`admin.js` を全面改修する。

---

## 変更1 — 顧客用注文ページ（index.html + app.js）

### 1-1. レイアウト：スプリットビュー（Landscape 対応）

**VER1**: メニュー全幅 → カートボタン → サイドバーで表示  
**VER2**: iPad Landscape 時に左右分割（常時表示）

```
┌─────────────────────────┬────────────────┐
│  タブ / メニューグリッド  │   カート       │
│  (3カラム)               │  （常時表示）  │
│                         │  アイテム一覧  │
│                         │  ──────────── │
│                         │  合計 ¥3,450  │
│                         │  [注文内容確認]│
└─────────────────────────┴────────────────┘
```

Portrait 時はカート = 固定フッター（合計 + ボタン）に変化。

実装方針:
- CSS Grid / `@media (orientation: landscape)` で分岐
- カートサイドバーとオーバーレイを Landscape では非表示にして、代わりに右パネルを常時表示

### 1-2. メニューカード：大型カード・3カラム化

```css
/* VER1: 1〜2カラム */
/* VER2 */
.menu-grid {
  grid-template-columns: repeat(3, 1fr); /* landscape */
}
@media (orientation: portrait) {
  .menu-grid { grid-template-columns: repeat(2, 1fr); }
}
```

カード内に「数量コントロール（−/＋）」を直接埋め込む（カートを開かずに数量調整可能）。

### 1-3. テーブル番号選択（新機能）

注文タイプ「店内」を選んだとき、テーブル番号（1〜10）をタップで選択できる。  
管理画面でテーブル番号が表示され、どのテーブルへ料理を運ぶか一目でわかる。

```
注文タイプ: [🍽️ 店内] [📅 予約注文]

テーブル番号:
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ 1│ │ 2│ │ 3│ │ 4│ │ 5│
└──┘ └──┘ └──┘ └──┘ └──┘
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│ 6│ │ 7│ │ 8│ │ 9│ │10│
└──┘ └──┘ └──┘ └──┘ └──┘
```

### 1-4. タッチ・iOS Safari 対策

- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">` — フォームタップ時の自動ズーム防止
- 全 `input` の `font-size: 16px`（これ以下だと iOS Safari がズームする）
- ボタン最小高さ: `min-height: 48px`
- カート操作の `−/＋` ボタン: 48×48px のタップ領域

### 1-5. 顧客名フィールドの見直し

VER1 ではひらがな自動変換があるが、iPad では IME 制御が難しくフリック入力と相性が悪い。  
`inputmode="kana"` を活用し、変換は IME に委ねる方式に変更。

---

## 変更2 — 管理画面（admin.html + admin.js）

### 2-1. レイアウト：カードグリッド（テーブル廃止）

**VER1**: `<table>` — 横スクロール必要、行タップ対象が小さい  
**VER2**: カードグリッド — 指でタップしやすく、情報量も確保

```
┌──────────────────┐ ┌──────────────────┐
│ ORD-20260531-001 │ │ ORD-20260531-002 │
│ 田中 たろう      │ │ 鈴木 はなこ      │
│ 🍗×2  🥩×1       │ │ 🥬×1  🍜×1       │
│ ¥3,060           │ │ ¥1,280           │
│ ┌──────────────┐ │ │ ┌──────────────┐ │
│ │  🟡 受付済  │ │ │ │  🔵 調理中  │ │
│ └──────────────┘ │ │ └──────────────┘ │
│ [→ 調理中へ]     │ │ [→ 準備完了へ]   │
└──────────────────┘ └──────────────────┘
```

Portrait: 2カラム / Landscape: 3カラム

### 2-2. ステータス変更：大型ボタン（スワイプ補助なし）

iPad では意図しないスワイプが起こりやすいため、スワイプジェスチャーは採用せず、  
各カード内に現在のステータス + 「→ 次のステータスへ」ボタンを大きく表示する。

ボタン高さ: `56px`、文字サイズ: `1rem`（タップミス防止）

### 2-3. 注文詳細パネル（Landscape 限定）

Landscape 時: 左=カードリスト（2カラム）、右=選択中注文の詳細パネル

```
┌────────────────────────┬──────────────────┐
│ 注文カード（一覧）      │ 詳細             │
│ ┌─────┐ ┌─────┐        │ ORD-001          │
│ │ 001 │ │ 002 │        │ 田中 たろう       │
│ └─────┘ └─────┘        │ 090-XXXX-XXXX    │
│ ┌─────┐ ┌─────┐        │ テーブル 3       │
│ │ 003 │ │ 004 │        │                  │
│ └─────┘ └─────┘        │ 🍗 ヤンニョム ×2 │
│                        │ 🥩 プルコギ ×1   │
│                        │ ──────────────── │
│                        │ ¥3,060           │
│                        │ [🖨️ 伝票印刷]   │
│                        │ [→ 調理中へ]     │
└────────────────────────┴──────────────────┘
```

### 2-4. 伝票印刷機能（新機能）

「伝票印刷」ボタンで `window.print()` を呼び出す。  
印刷用の CSS（`@media print`）で注文情報のみをシンプルに出力。

```css
@media print {
  .admin-header, .filters, .ai-import-panel, .stats-bar { display: none; }
  .order-receipt { display: block; font-size: 14pt; }
}
```

### 2-5. フィルタータブの強化

VER1 の小さな `filter-btn` を大型タブに変更。  
各タブに件数バッジを表示。

```
[ 全件 (12) ]  [ 受付済 (3) ]  [ 調理中 (5) ]  [ 準備完了 (2) ]  [ 完了 (2) ]
```

### 2-6. ヘッダーの整理

AI取込パネル / Gmailパネルはアコーディオン式（VER1と同じ）を維持しつつ、  
ヘッダー高さを `64px` に拡大（タップ誤操作を防ぐ）。

---

## 変更3 — 共通スタイル（style.css）

### 3-1. ベーススタイル

```css
:root {
  --tap-target: 48px;     /* Apple HIG 推奨 */
  --font-base: 17px;      /* iPad 最適フォントサイズ */
  --radius: 16px;         /* 少し大きめの角丸 */
}
body { font-size: var(--font-base); }
button, input, select { min-height: var(--tap-target); font-size: 16px; }
```

### 3-2. hover → active / focus-visible に統一

```css
/* VER1 */
button:hover { background: var(--primary-dark); }

/* VER2 */
button:active { background: var(--primary-dark); }
@media (hover: hover) {
  button:hover { background: var(--primary-dark); }
}
```

`@media (hover: hover)` で、マウスありデバイスのみ hover を有効にする。

### 3-3. スクロールの改善

iOS Safari では `-webkit-overflow-scrolling: touch` が効果的。  
`overscroll-behavior: contain` でカード内スクロールが外にバブルしないよう制御。

---

## 変更4 — data.js の拡張

テーブル番号フィールドを追加するため、`addOrder` の order オブジェクトに `tableNumber` を追加。  
Supabase の `orders` テーブルの `data` JSONB 列に保存するため、スキーマ変更不要。

```js
// VER2 で追加される注文フィールド
{
  type: 'instore',
  tableNumber: 3,        // 追加（予約時は null）
  customer: { name, phone },
  items: [...],
  total: 3060,
  ...
}
```

---

## 実装しない項目（スコープ外）

- PWA 化（iOS 15 の制約により効果が限定的）
- スワイプジェスチャーによるステータス変更（誤操作リスク）
- バーコードスキャン
- 顧客履歴管理

---

## 実装ステップ（実装時の順序）

1. `注文アプリv2/` ディレクトリを作成し、`config.js` / `data.js` をコピー
2. `css/style.css` — 共通ベーススタイル（変更3）
3. `css/order.css` — 注文ページ専用スタイル（変更1）
4. `index.html` + `js/app.js` — スプリットビュー・テーブル番号（変更1）
5. `css/admin.css` — 管理画面専用スタイル（変更2）
6. `admin.html` + `js/admin.js` — カードグリッド・詳細パネル（変更2）
7. `ai-import.js` / `gmail.js` をコピー（変更なし）
8. iPad Air 2 実機または Safari DevTools で動作確認
