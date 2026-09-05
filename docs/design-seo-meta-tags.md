# SEOメタタグ設計

## 1. 方針

検索結果とSNS共有の両方で、ページの内容・URL・サイトの識別情報が一貫して伝わることを目的とする。

- HTMLページはすべて、共通レイアウトから同じメタ項目を出力する
- title・description・keywordsは各ページの内容に合わせて定義する
- OGPのURLはAstroのサイト設定を基準に、現在のパスを結合した絶対URLにする
- OGP画像は既存のプロフィール画像を既定画像として使い、利用可能な作品画像はページ固有画像を優先し、相対URLを残さない
- 日本語サイトとして `og:locale=ja_JP` を固定する
- 管理画面もHTMLページとして項目を揃えるが、既存の `noindex` は維持する

なお、`keywords` はユーザー指定のメタ項目として実装する。現行の検索エンジンでは順位への直接的な影響は限定的なため、ページ内容を表す語の整理を主目的とする。

## 2. 設計

`src/layouts/BaseLayout.astro` を公開ページのメタデータ出力点とし、`admin` は認証画面専用の出力を持つ。ただし、どちらも同じメタデータ項目とURL検証の契約に従う。

- `title`: `Home` はサイト名、それ以外は「ページ名 | Hama Toshiya」
- `description`: ページ固有値。未指定時はサイト概要
- `keywords`: ページ固有の文字列配列をカンマ区切りで出力
- `og:title` / `og:description`: title / description と同じ値
- `og:type`: 通常ページは `website`、記事は既存の `article`
- `og:url`: `SITE_URL` と `Astro.url.pathname` から生成する絶対URL
- `og:site_name`: `SITE_TITLE`
- `og:locale`: `ja_JP`
- `og:image`: ページ指定値、または `/images/profile.webp` の絶対URL

記事詳細ページは既存のタグ配列を keywords に利用し、タグが空の場合は「技術記事」「Web開発」「フロントエンド」で補完する。タグ一覧ページは一覧全体を表す固定キーワードを使い、タグ詳細ページは現在のタグ名を含める。作品詳細ページは作品の機能・技術領域を表す語を個別に指定する。

対象はAstroがHTMLとして生成する公開ページ、404ページ、管理画面とする。RSS・robots.txt・sitemapはHTMLメタタグを持たない機械可読リソースのため対象外とする。

## 3. 検証

- BaseLayoutのコンテナテストで各メタ項目の出力を確認する
- SEO検証スクリプトのユニットテストで正常な生成HTML、ルート変換、`og:url` と生成ファイルの不一致を確認する
- `bun run seo:validate` で `dist/**/*.html` を走査し、対象HTMLごとにtitleと10項目の存在数・content値・絶対URL・生成ファイルパスとの一致・画像実体を確認する
- 記事詳細のkeywordsは記事タグ、タグ詳細のkeywordsは対象タグをページpropsから渡す
- `typecheck` と `build` で全ページのprops・静的生成を確認する
- PRのCIでlint、format、test、build、生成HTML検証を確認する
