# 中国語学習アプリ 設計仕様書

**日付**: 2026-05-19  
**対象**: 日本語話者向け中国語（普通話・簡体字）初心者学習PWA  
**参考**: `korean-study/` アプリと同構成・同UXパターン

---

## 1. 概要

`chinese-study/` ディレクトリに独立したPWAとして実装する。韓国語学習アプリのUI設計・ファイル構成を踏襲しつつ、中国語特有の4モジュール構成に拡張する。

---

## 2. ページ構成（アプローチ2: 4モジュール独立ページ）

| ファイル | 役割 |
|---------|------|
| `index.html` | ホーム：ストリーク・4モジュールカード・クイックアクセス |
| `conversation.html` | 会話練習（6シナリオ・台本方式チャットUI） |
| `tones.html` | 声調ドリル（4ステージ・2ステップ式） |
| `pinyin.html` | ピンイン練習（声母・韻母グリッド） |
| `measure-words.html` | 量詞クイズ（4択・20種） |
| `wordbook.html` | 単語帳 |

---

## 3. モジュール仕様

### 3.1 会話練習 (`conversation.html`)

- **シナリオ数**: 6（レストラン・ショッピング・交通・ホテル・カフェ・観光）
- **方式**: 韓国語アプリと同じ台本方式（キーワードマッチングで台本ノードを遷移）
- **表示形式**: チャットバブル。AIバブルに漢字・ピンイン・日本語訳の3層表示
- **単語保存**: 語彙チップをタップしてwordbookに追加
- **データ形式**: `data/scripts/*.json`（韓国語アプリと同スキーマ。`kr`→`zh`、`romanization`→`pinyin`）
- **TTS**: `speechSynthesis` lang=`zh-CN`

### 3.2 声調ドリル (`tones.html`)

- **ステージ数**: 4（Stage 1〜4、全問正解で次ステージ解放）
- **Step 1 — 聞き分け**: TTSで発音を再生し、第一声〜第四声の4択から選択（Stage 4のみ軽声を含む5択に拡張）
- **Step 2 — 視覚確認**: 漢字＋ピンイン（声調記号なし）を表示し、声調番号（1〜4）を4択から選択（Stage 4のみ0=軽声を追加）
- **フィードバック**: 正解時は声調記号付きピンインと意味を表示
- **進捗**: `ChineseState.tones.completedStages` に完了ステージを記録

### 3.3 ピンイン練習 (`pinyin.html`)

- **内容**: 声母（b p m f d t n l g k h j q x zh ch sh r z c s y w）と韻母（a o e i u ü など主要20音）
- **操作**: タイルをタップ → TTSで発音 → 口の形ヒントと日本語近似音を表示 → 「習得」ボタンで完了マーク
- **グリッド**: 4列表示。習得済みは緑色でチェックマーク
- **進捗**: `ChineseState.pinyin.completed[]` に習得済み音を記録

### 3.4 量詞クイズ (`measure-words.html`)

- **量詞数**: 20種（杯・本・张・只・条・件・双・块・瓶・碗・个・台・辆・匹・棵・粒・片・把・根・套）
- **形式**: `一 __ [名詞]` の空欄に入る量詞を4択で選択。日本語訳ヒントを併記
- **セット**: 5問×4セット。全問正解で次セット解放
- **フィードバック**: 正解時に量詞の用法説明（例: 杯=液体を入れる容器）を表示

---

## 4. 状態管理

`js/state.js` に `ChineseState` オブジェクトとして実装。localStorage キー: `chinese-study-v1`

```js
{
  streak: { count: 0, lastDate: null },
  conversation: { completedScenarios: [], totalSessions: 0 },
  tones: { currentStage: 1, completedStages: [], results: {} },
  pinyin: { completed: [] },
  measureWords: { currentSet: 1, completedSets: [], results: {} },
  wordbook: []
}
```

---

## 5. ファイル構成

```
chinese-study/
├── index.html
├── conversation.html
├── tones.html
├── pinyin.html
├── measure-words.html
├── wordbook.html
├── manifest.json
├── sw.js
├── css/
│   └── app.css              ← korean-study の app.css をベースに色変数を上書き
├── js/
│   ├── state.js             ← ChineseState
│   ├── speech.js            ← TTS/STT (zh-CN)
│   └── nav.js               ← BottomNav・Toast・SW登録
├── data/
│   ├── scripts/             ← 会話台本JSON × 6
│   │   ├── restaurant.json
│   │   ├── shopping.json
│   │   ├── transport.json
│   │   ├── hotel.json
│   │   ├── cafe.json
│   │   └── sightseeing.json
│   ├── tones-data.js        ← 声調ドリル問題データ
│   ├── pinyin-data.js       ← 声母・韻母データ
│   └── measure-words-data.js ← 量詞データ
└── icons/
    └── (PWAアイコン)
```

---

## 6. UI・スタイル

- **ベース**: `korean-study/css/app.css` のCSS変数・コンポーネントを流用
- **カラーパレット変更**:

| 変数 | 韓国語アプリ | 中国語アプリ |
|------|------------|------------|
| `--conv` | `#10B981`（緑） | `#10B981`（緑・維持） |
| `--drill` | `#8B5CF6`（紫） | `#EF4444`（赤：声調） |
| `--vowel` | `#F59E0B`（黄） | `#8B5CF6`（紫：ピンイン） |
| `--measure` | — | `#F59E0B`（黄：量詞・新規追加） |

- **フォント**: `Noto Sans SC`（簡体字対応）
- **最大幅**: 480px（モバイルファーストPWA）

---

## 7. PWA対応

- `manifest.json`: `name=中国語学習`, `theme_color=#EF4444`
- `sw.js`: 全静的ファイルをキャッシュ（オフライン完全対応）

---

## 8. 会話台本JSONスキーマ

韓国語アプリと同一スキーマ（フィールド名のみ変更）:

```json
{
  "id": "restaurant",
  "name": "レストラン",
  "beats": [
    {
      "id": "start",
      "reply_zh": "欢迎光临！请问您要点什么？",
      "reply_jp": "いらっしゃいませ！ご注文は？",
      "pinyin": "Huānyíng guānglín! Qǐngwèn nín yào diǎn shénme?",
      "vocabulary": [
        { "zh": "欢迎光临", "jp": "いらっしゃいませ", "pinyin": "huānyíng guānglín" }
      ],
      "transitions": [
        { "keywords": ["咖啡", "coffee", "コーヒー"], "next": "order_coffee" },
        { "default": true, "next": "ask_again" }
      ]
    }
  ]
}
```

---

## 9. 実装しないもの（スコープ外）

- AIによるリアルタイム翻訳・添削（韓国語アプリと同様にオフライン固定台本方式）
- 繁体字対応（簡体字のみ）
- Capacitor/ネイティブアプリ化（WebアプリPWAのみ）
- ユーザー認証・クラウド同期
