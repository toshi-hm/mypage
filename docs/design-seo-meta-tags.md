# SEOメタタグ設計

## 1. 方針

検索結果とSNS共有の両方で、ページの内容・URL・サイトの識別情報が一貫して伝わることを目的とする。

- HTMLページはすべて、共通レイアウトから同じメタ項目を出力する
- title・description・keywordsは各ページの内容に合わせて定義する
- OGPのURLはAstroのサイト設定を基準に、現在のパスを結合した絶対URLにする
- OGP画像は既存のプロフィール画像を全ページの既定画像として使い、相対URLを残さない
- 日本語サイトとして `og:locale=ja_JP` を固定する
- 管理画面もHTMLページとして項目を揃えるが、既存の `noindex` は維持する

なお、`keywords` はユーザー指定のメタ項目として実装する。現行の検索エンジンでは順位への直接的な影響は限定的なため、ページ内容を表す語の整理を主目的とする。

## 2. 設計

`src/layouts/BaseLayout.astro` をメタデータの単一出力点とする。

| 項目 | 出力方法 |
| --- | --- |
| `title` | `Home` はサイト名、それ以外は「ページ名 | Hama Toshiya」 |
| `description` | ページ固有値。未指定時はサイト概要 |
| `keywords` | ページ固有の文字列配列をカンマ区切りで出力 |
| `og:title` / `og:description` | title / description と同じ値 |
| `og:type` | 通常ページは `website`、記事は既存の `article` |
| `og:url` | `SITE_URL` + `Astro.url.pathname` の絶対URL |
| `og:site_name` | `SITE_TITLE` |
| `og:locale` | `ja_JP` |
| `og:image` | ページ指定値、または `/images/profile.webp` の絶対URL |

記事詳細ページは既存のタグ配列を keywords に利用し、タグ一覧ページは現在のタグ名を含める。作品詳細ページは作品の機能・技術領域を表す語を個別に指定する。

対象はAstroがHTMLとして生成する公開ページ、404ページ、管理画面とする。RSS・robots.txt・sitemapはHTMLメタタグを持たない機械可読リソースのため対象外とする。

## 3. 検証

- BaseLayoutのコンテナテストで10項目の出力を確認する
- `typecheck` と `build` で全ページのprops・静的生成を確認する
- PRのCIでlint、format、test、buildを確認する
