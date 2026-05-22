# Obsidian外部脳 統合設計

**日付:** 2026-05-22  
**ステータス:** 承認済み

## 概要

Claude CodeのセッションをまたいでObsidian Vaultを「外部脳」として活用する。
MCP経由でObsidianを読み書きし、知識・決定・プロジェクト状態・好みを永続化する。

## アーキテクチャ

```
Claude Code (セッション)
        ↕ MCP (mcp-obsidian)
Obsidian Local REST API (localhost:27123)
        ↕
  Obsidian Vault/
  ├── Knowledge/
  ├── Decisions/
  ├── Projects/
  └── Preferences/
```

### コンポーネント

| コンポーネント | 役割 |
|---|---|
| `mcp-obsidian` (npm) | ObsidianのREST APIをMCPツールとして公開 |
| `.mcp.json` | MCPサーバーをClaude Codeに登録 |
| `CLAUDE.md` | Claudeに読み書きタイミングを指示 |
| `Stop`フック | セッション終了時にサマリー書き込みを促す |

### 既存メモリとの役割分担

| システム | 役割 |
|---|---|
| ローカル自動メモリ (`/memory/`) | クイックアクセス用ローカルキャッシュ（継続使用） |
| Obsidian Vault | セッション横断の「真実の源泉」、構造化された知識 |

## Vaultフォルダ構成

```
vault/
├── Knowledge/          # 技術的な知見・解決したバグ・新しい発見
│   └── mistakes.md     # AIのミス記録
├── Decisions/          # 判断・選択・方針決定の記録
├── Projects/           # 進行中のプロジェクトの状態
└── Preferences/        # 自分の好み・作業スタイル
```

### 各フォルダの用途

- **Knowledge/**: 技術的な解決策、バグ修正の知見、新しい発見、ライブラリの使い方など
- **Decisions/**: アーキテクチャの選択、方針決定、「なぜこうしたか」の記録
- **Projects/**: 各プロジェクトの現在状態、TODO、進捗
- **Preferences/**: ユーザーの作業スタイル、好みのコーディングスタイル、指示パターン

## 読み書きルール

### セッション開始時
1. `Projects/` 内の関連プロジェクトノートを読み込む
2. `Preferences/` を参照してユーザーの好みを把握する

### セッション中（随時）
- 重要な設計決定 → `Decisions/` に即座に書き込む
- 技術的な知見・バグ解決 → `Knowledge/` に追記
- AIのミス・修正 → `Knowledge/mistakes.md` に記録
- プロジェクト状態の変化 → `Projects/` を更新

### セッション終了時（Stopフックで促す）
1. 作業サマリーを `Projects/<project-name>.md` に追記
2. 重要な決定・知見があれば各フォルダに反映

## 初期セットアップ手順

**トリガー:** ユーザーが「初期セットアップして」と発言したとき（初回のみ）

**Claudeが行う手順:**
1. MCPで上記4フォルダを作成
2. 各フォルダに `.gitkeep` を配置（フォルダが空でも残るように）
3. `Knowledge/mistakes.md` を空ファイルとして作成
4. 完了後にユーザーへ報告:
   - 作成したフォルダ一覧と各役割
   - 最初に書くと良いもの（例: `Preferences/profile.md` に自己紹介を書くとAIがユーザーを覚えやすくなる）

**注意:** 通常の会話ではこのセクションを参照しない。

## MCPサーバー設定

### .mcp.json への追加

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "<Local REST APIのAPIキー>",
        "OBSIDIAN_HOST": "http://localhost:27123"
      }
    }
  }
}
```

### 前提条件
- Obsidian がインストール・起動済み
- Local REST API プラグインがインストール・有効化済み
- APIキーを取得済み（プラグイン設定画面で確認）

## CLAUDE.md への追加内容

```markdown
## Obsidian外部脳

### 基本方針
ObsidianのVaultをセッション横断の「外部脳」として使用する。
MCPサーバー `obsidian` 経由で読み書きする。

### セッション開始時
必ず Projects/ 内の関連プロジェクトノートと Preferences/ を読み込むこと。

### 随時書き込み
- 重要な決定 → Decisions/
- 技術的知見・バグ解決 → Knowledge/
- AIのミス・修正 → Knowledge/mistakes.md
- プロジェクト状態 → Projects/

### 初期セットアップ
ユーザーから「初期セットアップして」と言われた場合のみ、
セットアップ手順を実行する（通常会話では不要）。
```

## Stopフック設定

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'セッション終了: Obsidianへのサマリー書き込みを忘れずに'"
          }
        ]
      }
    ]
  }
}
```

## 実装タスク（概要）

1. `mcp-obsidian` のAPIキー取得（ユーザーがObsidianで確認）
2. `.mcp.json` にobsidianサーバーを追加
3. `CLAUDE.md` に外部脳の指示を追記
4. `settings.json` にStopフックを追加
5. 動作確認（MCPでVaultにアクセスできるか）
6. 「初期セットアップして」でVault構造が作成されるか確認
