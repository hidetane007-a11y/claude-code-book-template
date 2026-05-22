# Claude Code 設定

## Obsidian外部脳

ObsidianのVaultをセッション横断の「外部脳」として使用する。
MCPサーバー `obsidian` 経由で読み書きする。

### セッション開始時
必ず以下を読み込むこと：
1. `Projects/` 内の関連プロジェクトノート
2. `Preferences/` でユーザーの好みを把握

### 随時書き込み（重要な変化があったとき即座に）
- 重要な設計決定・方針 → `Decisions/`
- 技術的知見・バグ解決 → `Knowledge/`
- AIのミス・修正指示 → `Knowledge/mistakes.md` に追記
- プロジェクト状態の変化 → `Projects/`

### 初期セットアップ
ユーザーから「初期セットアップして」と言われたとき**のみ**、以下を実行する：
1. Vault直下に `Knowledge/`, `Decisions/`, `Projects/`, `Preferences/` フォルダを作成
2. 各フォルダに `.gitkeep` を配置
3. `Knowledge/mistakes.md` を空ファイルとして作成
4. 完了後にユーザーへ報告：
   - 作成したフォルダ一覧と各役割
   - 最初に書くと良いもの（例：`Preferences/profile.md` に自己紹介を書くとAIがユーザーを覚えやすくなる）

通常の会話ではこのセクションを参照しない。
