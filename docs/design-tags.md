# タグ別一覧 設計ドキュメント

記事機能(`docs/design-articles.md`)のタグを、一覧・絞り込みに使えるページとして公開する。

## 1. 目的

- 記事が増えたときにテーマ単位で辿れる導線を作る
- 記事カード・記事詳細のタグ表示をリンクにして回遊性を上げる

## 2. 画面構成

| パス           | 内容                                                   |
| -------------- | ------------------------------------------------------ |
| `/tags/`       | タグ一覧(記事数付き。件数降順 → 同数はタグ名昇順)      |
| `/tags/<tag>/` | タグ別の記事一覧(pubDate 降順、draft 除外は既存と同じ) |

- `ArticleCard` と記事詳細のタグを `/tags/<tag>/` へのリンクに変更する
- Header のナビには追加しない(Articles 起点の回遊導線とする。ナビ肥大を避ける)

## 3. タグ規約(スキーマで強制)

- タグは**英数字ケバブケース**(`^[a-z0-9]+(-[a-z0-9]+)*$`)を zod スキーマで強制する
  - 理由: タグはそのまま URL(`/tags/<tag>/`)になるため、記事スラッグと同じ規約に揃える
  - 違反は `astro build` / `astro check` で検出され CI で fail する
- 表示名が必要になったら(日本語ラベル等)、将来 `src/consts.ts` にタグ→表示名マップを追加する
  (現時点では YAGNI)

## 4. 実装構成

- `src/utils/articles.ts` に `collectTags(entries)` を追加(純関数・テスト対象)
  - 公開記事のタグを集計し `{ tag, count }[]` を返す(count 降順 → tag 昇順)
- `src/pages/tags/index.astro`: `collectTags` の結果を表示
- `src/pages/tags/[tag].astro`: `getStaticPaths` でタグごとにページ生成
- `src/components/TagList.astro`: タグリンク列(カード・詳細・タグ一覧で共用)

## 5. テスト方針

- `collectTags`: 集計・並び順(count 降順 / 同数は名前昇順)・タグなし記事の扱い
- `TagList.astro`: Container API でリンク先(`/tags/<tag>/`)を検証
- タグ規約: zod スキーマが不正タグを reject することを確認(スキーマを直接テスト)

## 6. 非スコープ

- タグの表示名(日本語ラベル)対応
- タグクラウド・関連記事
