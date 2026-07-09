# Works(制作物)ページ 設計ドキュメント

制作物・プロジェクトを紹介する `/works/` ページを追加する。

## 1. 目的

- 個人ホームページとしての中核コンテンツ(何を作ってきたか)を見せる場所を作る
- 記事と同様に**リリースなし**(データ編集のコミットのみ)で追加・更新できるようにする

## 2. データモデル

- データは `src/content/works.json`(単一 JSON ファイル)で管理し、
  Astro content collections の **file loader** で読み込む
- Markdown 本文を持たない「一覧データ」なので、記事(glob loader + md)とは使い分ける

| フィールド    | 型           | 必須            | 説明                           |
| ------------- | ------------ | --------------- | ------------------------------ |
| `id`          | string       | ✅              | 識別子(英数字ケバブケース)     |
| `name`        | string       | ✅              | 名称                           |
| `description` | string       | ✅              | 説明(1〜2 文)                  |
| `url`         | string (URL) | -               | デモ・サイトへのリンク         |
| `repo`        | string (URL) | -               | リポジトリへのリンク           |
| `tech`        | string[]     | -(既定 `[]`)    | 使用技術                       |
| `featured`    | boolean      | -(既定 `false`) | トップページに表示するか       |
| `order`       | number       | -(既定 `0`)     | 表示順(昇順。同値は name 昇順) |

- zod スキーマ(`src/content.config.ts`)で検証し、違反は CI で検出
- Sveltia CMS にも **file collection** として登録し、`/admin/` から編集可能にする

## 3. 画面構成

| パス      | 内容                                                     |
| --------- | -------------------------------------------------------- |
| `/works/` | 制作物一覧(order 昇順 → name 昇順)                       |
| `/`(既存) | `featured: true` の works を「Featured Works」として表示 |

- Header ナビに「Works」を追加(Home / Articles / Works / About)
- カードは `WorkCard.astro`(名称・説明・tech タグ・デモ/リポジトリリンク)

## 4. 実装構成

- `src/content.config.ts`: `works` コレクション追加(file loader)
- `src/content/works.json`: データ本体(サンプル 2 件)
- `src/utils/works.ts`: `sortWorks()`(order 昇順 → name 昇順、純関数)
- `src/components/WorkCard.astro` / `src/pages/works/index.astro`
- `public/admin/config.yml`: works の file collection 追加

## 5. テスト方針

- `sortWorks`: 並び順の単体テスト
- `WorkCard.astro`: Container API(リンク・tech タグ・リンク省略時の描画)
- スキーマ違反(id 規約など)はビルド・`astro check` で CI 検出

## 6. 非スコープ

- 制作物の詳細ページ(`/works/<id>/`)。説明が長くなったら検討
- スクリーンショット画像の運用
