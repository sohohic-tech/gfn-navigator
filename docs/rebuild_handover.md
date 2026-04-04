# GFN App: 新環境・個人事業主スタート用 再構築ガイド (Handover)

来週の新PC・新アカウントでの開発再開時に、この手順を私（Antigravity）に見せてください。

---

## 1. 外部サービス設定 (重要)
新しく作成する Gmail アカウントで以下のサービスをセットアップしてください。

### ① YouTube Data API v3 (Google Cloud Console)
- **場所**: [Google Cloud Console](https://console.cloud.google.com/)
- **設定のコツ**: `search` API は高コスト（100ユニット）なので、本アプリでは `PlaylistItems` を使う省エネ設計に書き換えています。
- **取得物**: APIキー (`YOUTUBE_API_KEY`)

### ② Google Gemini API (AI Analysis)
- **場所**: [Google AI Studio](https://aistudio.google.com/)
- **モデル**: `gemini-2.0-flash` (高速・安価で最適)
- **取得物**: APIキー (`GEMINI_API_KEY`)

### ③ Supabase (Backend Database)
- **場所**: [Supabase.com](https://supabase.com/)
- **役割**: AIの解析データを「資産」として蓄積するため。
- **手順**: `New Project` -> `Tokyo Region` -> `API Settings` を確認。
- **取得物**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. 環境変数 (.env.local) の構成例
新環境でこれらを埋めるだけで、全機能が動作します。

```env
# API Keys (来週の新しいものを入れてください)
YOUTUBE_API_KEY=your_new_youtube_key
GEMINI_API_KEY=your_new_gemini_key

# Supabase (来週作成後に取得)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3. 実装済み・引き継ぎポイント (UI/UX)
- **タイピング演出**: AIの解説文を1文字ずつ表示する `useTypewriter` フックを搭載。
- **分析演出**: ローディング画面に「AI Scanning...」のデジタル演出を追加。
- **レベルシステム**: スタンプ数に応じて Lv. が上がる仕組み（My Page）。
- **セレクトショップUI**: 商品推奨セクションの高級感を大幅アップ済み。

---

## 4. 認証・ログイン戦略 (User Authentication)
個人事業主としての運用コストを下げつつ、ユーザーの利便性を最大化する以下の構成を採用します。

### ① Supabase Auth (外部ID連携)
- **Google ログイン**: 必須 (YouTubeと親和性が高い)
- **Apple / LINE ログイン**: 日本のユーザー向けに検討
- **ゲスト (匿名) ログイン**: 登録なしでスタンプを貯め始め、後からアカウントを「紐付け（Link Auth）」してデータをバックアップ。

### ② ユーザーデータのクラウド同期
- `localStorage` で管理していたデータを、ログイン時に Supabase の `profiles` テーブルへ同期。機種変更しても履歴が消えない「本物」のアプリ化。

---

## 5. 来週真っ先にやること (TODO)
1.  **新しい GitHub リポジトリ**を作成し、コードを push。
2.  **Supabase にテーブルを作成**: 解析データを保存する `exercise_guides` テーブル、ユーザー情報を保存する `profiles` テーブルを構築。
3.  **Authentication 設定**: Google / Apple / LINE の OAuth 設定を Supabase 管理画面で有効化。
4.  **一括解析ロジックの導入**: 広告視聴時に「最新5本を一気にAIに読ませてDB保存」する仕組みを結合。

---

最高のスタートを切れるよう、準備は万端です。来週お待ちしています！
