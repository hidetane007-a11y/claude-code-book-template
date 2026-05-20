# 英語学習アプリ 設計仕様書

**日付**: 2026-05-20
**対象**: 日本語話者向け英語（ビジネス英語）初級〜中級学習PWA
**参考**: `korean-study/` アプリと同構成・同UXパターン

---

## 1. 概要

`english-study/` ディレクトリに独立したPWAとして実装する。韓国語学習アプリのUI設計・ファイル構成を踏襲しつつ、ビジネス英語に特化した4モジュール構成とする。

---

## 2. ページ構成（4モジュール独立ページ）

| ファイル | 役割 |
|---------|------|
| `index.html` | ホーム：ストリーク・4モジュールカード・クイックアクセス |
| `conversation.html` | 会話練習（5シナリオ・台本方式チャットUI） |
| `drill.html` | 文法ドリル（動詞変化トラック・文型トラック 各4ステージ） |
| `pronunciation.html` | 発音練習（キー音 + 語強勢） |
| `phrasebook.html` | フレーズ帳（会話から保存したビジネスフレーズ一覧） |

---

## 3. モジュール仕様

### 3.1 会話練習 (`conversation.html`)

- **シナリオ数**: 5
  1. Meeting（会議）— 議題提示・意見交換・決定
  2. Phone（電話応対）— 取り次ぎ・伝言・折り返し
  3. Presentation（プレゼン）— 導入・説明・Q&A
  4. Small talk（雑談）— 天気・週末・趣味
  5. Negotiation（交渉）— 価格・条件・合意
- **方式**: 韓国語アプリと同一の台本方式（キーワードマッチング → ノード遷移）
- **表示形式**: チャットバブル。AIバブルに英文 + 日本語訳の2層表示
- **フレーズ保存**: フレーズチップをタップしてphrasebookに追加
- **データ形式**: `data/scripts/*.json`（`reply_kr` → `reply_en`、`romanization` フィールド削除）
- **TTS**: `speechSynthesis` lang=`en-US`

#### 会話台本JSONスキーマ

```json
{
  "id": "meeting",
  "name": "Meeting",
  "beats": [
    {
      "id": "start",
      "reply_en": "Good morning, everyone. Let's get started. Today's agenda is...",
      "reply_jp": "おはようございます。では始めましょう。本日の議題は…",
      "vocabulary": [
        { "en": "agenda", "jp": "議題", "pronunciation": "əˈdʒendə" }
      ],
      "transitions": [
        { "keywords": ["question", "ask", "clarify"], "next": "clarify" },
        { "default": true, "next": "proceed" }
      ]
    }
  ]
}
```

### 3.2 文法ドリル (`drill.html`)

- **2トラック構成**（タブで切り替え）

**Track A — 動詞変化** (4ステージ)
| Stage | 内容 |
|-------|------|
| 1 | 現在形（三単現・疑問文・否定文） |
| 2 | 過去形（規則・不規則動詞） |
| 3 | 現在完了形（have done / have been） |
| 4 | 未来形（will / be going to / present progressive） |

**Track B — ビジネス文型** (4ステージ)
| Stage | 内容 |
|-------|------|
| 1 | 提案・申し出（I'd like to / Could I / Shall I） |
| 2 | 依頼・お願い（Could you / Would you mind / I was wondering if） |
| 3 | 同意・反対（I agree / I see your point but / Actually） |
| 4 | 仮定・条件（If ... / Assuming that / In case） |

- **形式**: 4択選択問題（韓国語アプリと同仕様）
- **全問正解で次ステージ解放**
- **進捗**: `EnglishState.drill.verbTrack` / `EnglishState.drill.patternTrack`

### 3.3 発音練習 (`pronunciation.html`)

- **Part 1 — キー音** (3グループ × 5音ペア = 15問)
  - L/R（light/right, lead/read など）
  - TH（this/dis, think/sink など）
  - V/B（vine/bine, vest/best など）
- **Part 2 — 語強勢** (ビジネス語20語)
  - 名詞と動詞でアクセント位置が変わる語（PREsent/preSENT, REcord/reCORD など）
  - 2〜4音節のビジネス語（deCIsion, proPOsal, negOTiate など）
- **操作**: タイルタップ → TTS再生 → 正解選択 → 「習得」完了マーク
- **グリッド**: 4列表示。習得済みは緑色でチェックマーク
- **進捗**: `EnglishState.pronunciation.completed[]`

### 3.4 フレーズ帳 (`phrasebook.html`)

- 会話練習画面で語彙チップをタップして保存（韓国語の単語帳と同様）
- 保存単位は**フレーズ1文**（"I'd like to propose..." など）
- 一覧表示 + TTS再生 + 削除
- データ形式: `{ en: string, jp: string, savedAt: string }`

---

## 4. 状態管理

`js/state.js` に `EnglishState` オブジェクトとして実装。localStorage キー: `english-study-v1`

```js
{
  streak: { count: 0, lastDate: null },
  conversation: { completedScenarios: [], totalSessions: 0 },
  drill: {
    verbTrack: { currentStage: 1, completedStages: [], results: {} },
    patternTrack: { currentStage: 1, completedStages: [], results: {} }
  },
  pronunciation: { completed: [] },
  phrasebook: []   // { en, jp, savedAt }
}
```

---

## 5. ファイル構成

```
english-study/
├── index.html
├── conversation.html
├── drill.html
├── pronunciation.html
├── phrasebook.html
├── manifest.json
├── sw.js
├── css/
│   └── app.css              ← korean-study の app.css をベースに色変数を変更
├── js/
│   ├── state.js             ← EnglishState
│   ├── speech.js            ← TTS/STT (en-US)
│   └── nav.js               ← BottomNav・Toast・SW登録
└── data/
    ├── scripts/             ← 会話台本JSON × 5
    │   ├── meeting.json
    │   ├── phone.json
    │   ├── presentation.json
    │   ├── smalltalk.json
    │   └── negotiation.json
    └── drill-data.js        ← 文法ドリル問題データ（Track A + B）
```

---

## 6. UI・スタイル

- **ベース**: `korean-study/css/app.css` のCSS変数・コンポーネントを流用
- **カラーパレット変更**:

| 変数 | 韓国語アプリ | 英語アプリ |
|------|------------|-----------|
| `--primary` | `#3B82F6`（青） | `#1D4ED8`（紺：ビジネス感） |
| `--conv` | `#10B981`（緑） | `#10B981`（緑・維持） |
| `--drill` | `#8B5CF6`（紫） | `#8B5CF6`（紫・維持） |
| `--vowel` | `#F59E0B`（黄） | `#F59E0B`（黄：発音） |
| `--phrase` | —（なし） | `#0EA5E9`（水色：フレーズ帳・新規追加） |

- **最大幅**: 480px（モバイルファーストPWA）

---

## 7. PWA対応

- `manifest.json`: `name=英語学習`, `theme_color=#1D4ED8`
- `sw.js`: 全静的ファイルをキャッシュ（オフライン完全対応）

---

## 8. サーバー・API

- `server.js` の `/api/korean-stream` を `/api/english-stream` として追加（既存コードを流用）
- モデル: `claude-haiku-4-5-20251001`（速度優先）
- TTS: Web Speech API `speechSynthesis` lang=`en-US`
- SSE（Server-Sent Events）でストリーミング返答

---

## 9. 実装しないもの（スコープ外）

- AIによるリアルタイム翻訳・添削（オフライン固定台本方式のみ）
- Capacitor/ネイティブアプリ化（WebアプリPWAのみ）
- ユーザー認証・クラウド同期
- 繁体字・地域別英語対応（en-USのみ）
