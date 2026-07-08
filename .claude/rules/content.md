# 記事コンテンツ規約

- 記事は `src/content/articles/<slug>.md`。frontmatter は `src/content.config.ts` の zod スキーマに従う
- スラッグ(ファイル名)は英数字ケバブケース必須(`^[a-z0-9]+(-[a-z0-9]+)*$`)。日本語スラッグ不可。テストで強制される
- 日付はファイル名に入れず frontmatter の `pubDate` で管理する
- 本文の見出しは H2(`##`)から始める(H1 はレイアウトが `title` から出力する)
- 未完成の記事は `draft: true` を付ける(本番ビルドから除外、dev では表示)
- 記事の frontmatter フィールドを追加・変更する場合は、`src/content.config.ts` と `public/admin/config.yml` を必ず同期させ、`docs/design-articles.md` を更新する
- 記事内の画像は `public/images/articles/` に置き、`/images/articles/...` で参照する
