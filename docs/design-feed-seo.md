# RSS・サイトマップ・SEO 基盤 設計ドキュメント

記事機能(`docs/design-articles.md`)の上に、フィード配信と検索エンジン向けの基盤を追加する。

## 1. 目的

- RSS リーダーで記事の更新を購読できるようにする(リリースなし運用と相性が良い)
- 検索エンジンにサイト構造を正しく伝える(sitemap / robots.txt / canonical)
- OGP の URL 情報を整備し、シェア時の見た目を安定させる

## 2. 構成

| 項目               | 実装                                   | 内容                                                       |
| ------------------ | -------------------------------------- | ---------------------------------------------------------- |
| RSS                | `src/pages/rss.xml.ts`(`@astrojs/rss`) | 公開記事(draft 除外)を pubDate 降順で配信                  |
| サイトマップ       | `@astrojs/sitemap` integration         | ビルド時に `sitemap-index.xml` を生成。`/admin/` は除外    |
| robots.txt         | `src/pages/robots.txt.ts`              | 動的生成。`/admin/` を Disallow、Sitemap を絶対 URL で記載 |
| canonical / og:url | `BaseLayout.astro`                     | `Astro.site` + パスから生成                                |
| RSS autodiscovery  | `BaseLayout.astro`                     | `<link rel="alternate" type="application/rss+xml">`        |
| フッター導線       | `Footer.astro`                         | RSS リンクを追加                                           |

## 3. 設計判断

1. **フィード項目の生成ロジックは `src/utils/articles.ts` の `toFeedItems()` に分離**
   `astro:content` に依存しない純関数にして Vitest で直接テストする(rss.xml.ts 自体は薄い接着層)
2. **robots.txt は `public/` の静的ファイルではなく動的ルートで生成**
   Sitemap 行は絶対 URL が必要なため、`astro.config.ts` の `site` から導出して重複管理を避ける
3. **`site` は暫定 URL のまま**(`https://mypage.example.com`)
   デプロイ時に本番ドメインへ変更する(TODO コメント済み)。canonical / RSS / sitemap はすべて
   `site` から導出されるため、変更は 1 箇所で済む
4. **`/admin/` はすべてのクローラ導線から除外**
   sitemap の filter、robots.txt の Disallow、既存の `noindex` メタの三重で防ぐ

## 4. テスト方針

- `toFeedItems()`: 並び順(pubDate 降順)・link 形式(`/articles/<slug>/`)・description
  (excerpt フォールバック)を単体テスト
- RSS / sitemap / robots.txt の出力はビルド(CI の build ジョブ)で生成エラーを検出

## 5. 非スコープ

- OGP 画像の自動生成
- JSON Feed / Atom
- 構造化データ(JSON-LD)
