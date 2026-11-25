# nomiメモとは？

飲み会で**だれと飲んで、何の話をしたか**を記録して、次に会ったときの話のきっかけにする Web アプリです。

サークル・クラス・バイト先の飲み会では、「AWS の勉強をしていると言っていた」「インターンに行くと話していた」といった話を、次に会うころには忘れてしまいがちです。nomiメモは飲み会を1つの「投稿」として残し、Instagram のようなタイムラインで振り返れるようにします。

- 公開 URL：https://nomimemo.vercel.app
- アイデアの詳細：[idea.md](idea.md)

## できること（予定）

- ログイン（自分の記録は自分しか見られない）
- 飲み会の作成：タイトル・日時・場所・写真・メモ
- 参加者の登録（同姓同名でも別人として登録できる）
- 話題タグの登録（`#AWS` `#就活` など）
- タイムライン：過去の飲み会を新しい順に縦スクロールで見る
- 飲み会の詳細・編集・削除
- 検索：「AWS」で検索すると、その話をした飲み会が出てくる

人物ごとのプロフィール画面などは、余裕があれば作ります（[idea.md](idea.md) の「将来的な機能」）。

## こだわり：「自分のデータしか触れない」を DB で守る

飲み会の記録は、だれと何を話したかという個人的な内容です。だから「他人の記録が見えない・書き換えられない」を、画面の作りに頼らず **DB（Supabase の RLS と外部キー）** で保証します。画面側にバグがあっても、他人のデータは返ってきません。

| 状況 | 結果 | どうやって |
|---|---|---|
| 未ログインで読もうとする | どの表も読めない | `anon` からすべての権限を外す |
| 他人のデータを読む・更新・削除しようとする | 0件扱い（何も起きない） | RLS：「`user_id` が自分」の1条件で全テーブル統一 |
| `user_id` を他人にして作成しようとする | エラー | RLS の `with check` |
| 自分のタグを他人の飲み会に付けようとする | エラー | `(event_id, user_id)` の複合外部キー |

作成時の `user_id` は DB が自動でログイン中のユーザーにするので、アプリ側で指定する必要はありません。表の設計は [docs/DB.md](docs/DB.md) にまとめています。

## いまの状態

[Issue](https://github.com/dokkanoT/nomimemo/issues) とマイルストーン（M1 通しで動く → M2 記録を充実 → M3 検索と仕上げ）に沿って進めています。

- [x] Supabase プロジェクト作成と環境変数の整備（#1）
- [x] DB スキーマと RLS のマイグレーション（#2）
- [x] CI・main ブランチ保護・チーム設定（#18, #19）
- [x] Supabase の自動停止を防ぐ定期アクセス（GitHub Actions）
- [ ] 型生成とデータアクセス層＋モック（#3）
- [ ] 認証：ログイン・ログアウト・未ログイン時のリダイレクト（#4, #12）
- [ ] 飲み会の CRUD・作成フォーム（#5, #13）
- [ ] 写真のアップロード（#6, #14）
- [ ] 参加者・タグの保存と入力 UI（#7, #15）
- [ ] 共通レイアウト・タイムライン・詳細画面（#9, #10, #11）
- [ ] 編集・削除 UI（#16）
- [ ] 検索（#8, #17）

## 技術スタック

| 用途 | 使用技術 |
|---|---|
| フレームワーク | Next.js 16（App Router）+ TypeScript |
| UI | Tailwind CSS v4（スマホでの見た目を優先） |
| DB・認証・画像保存 | Supabase（PostgreSQL + RLS、Auth、Storage） |
| Supabase との接続 | `@supabase/ssr`（cookie でセッションを持つ） |
| CI | GitHub Actions（lint・ビルド） |
| 定期実行 | GitHub Actions の schedule（Supabase の停止防止） |
| ホスティング / CD | Vercel（PR ごとにプレビュー URL が出る） |

> Next.js 16 では `middleware` が `proxy` に名前が変わるなど、ネットの古い記事と書き方が違うところがあります。迷ったら `node_modules/next/dist/docs/` を見てください。

## 動かし方

Node.js 22 以上、npm で確認しています。

```bash
npm ci
cp .env.example .env.local
```

`.env.local` に次の値を入れます（値は BE 担当から個別に送ります。GitHub には上げないでください）。

| 変数 | 中身 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL（Project Settings → API） |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase の publishable key（`sb_publishable_...`） |

```bash
npm run dev
```

http://localhost:3000 を開きます。

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルドしたものを起動 |
| `npm run lint` | コード解析 |

DB のスキーマを変えたいときは、BE 担当に相談してから `supabase/migrations/` に新しいマイグレーションを追加します（手順は [docs/DB.md](docs/DB.md)）。

## Supabase の停止防止

Supabase の無料プランは、7日間アクセスがないとプロジェクトが一時停止します。開発が空いた週に止まらないよう、GitHub Actions が**毎週月曜・木曜の 9:00（日本時間）**に `keepalive` 表の1行を更新します（[.github/workflows/supabase-keepalive.yml](.github/workflows/supabase-keepalive.yml)）。

- 行は1行だけで上書きするので、表は大きくなりません
- `keepalive` 表は RLS を有効にしてポリシーを作っていないので、アプリ（publishable key）からは読み書きできません
- リポジトリの Secrets に `SUPABASE_URL` と `SUPABASE_SECRET_KEY`（`sb_secret_...`）が必要です
- Actions タブの「Supabase keepalive」→「Run workflow」で手動でも実行できます
- 公開リポジトリでは 60 日間コミットがないと GitHub が定期実行を止めるので、長く空くときは Actions タブで有効になっているか確認してください

## ディレクトリ構成

```
app/                  画面（App Router）
  layout.tsx          全画面共通のレイアウト
  page.tsx            トップ（タイムラインになる予定）
lib/
  supabase/
    client.ts         Client Component 用の Supabase クライアント
    server.ts         Server Component / Server Action 用の Supabase クライアント
    proxy.ts          リクエストごとにログインセッションを更新する
proxy.ts              全リクエストで lib/supabase/proxy.ts を呼ぶ（旧 middleware）
supabase/migrations/  DB のスキーマと RLS（SQL）
docs/
  TEAM_GUIDE.md       チーム開発ガイド（最初に読む資料）
  DB.md               データベース設計
.github/workflows/    CI と Supabase の停止防止
idea.md               アプリのアイデア
```

画面の部品は `components/ui/`（共通部品）と `components/forms/`（フォーム部品）に置く予定です。

## CI

GitHub Actions で、プルリクエストと main への push のたびに lint とビルドを実行します（[.github/workflows/ci.yml](.github/workflows/ci.yml)）。赤くなったら、手元で `npm run lint` と `npm run build` を試してください。

## 開発の進め方

| 担当 | 範囲 |
|---|---|
| BE（dokkanoT） | Supabase・DB 設計・認証・データ保存/取得・写真保存・検索 |
| FE-A | 見る画面：共通レイアウト・共通 UI 部品・タイムライン・詳細 |
| FE-B | 書く画面：ログイン・作成フォーム・写真選択・参加者/タグ入力・編集削除・検索画面 |

- 1つの Issue につき、ブランチ1本・プルリクエスト1つ（本文に `closes #番号`）
- main に直接 push しない。CI が緑になってからマージする
- 30 分悩んだら Issue のコメントで聞く

詳しい手順は [docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md) にまとめています。
