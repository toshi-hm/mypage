# 記事の追加・公開方法

サイト運用者向けの記事作成手順。ここにある内容は公開記事には含めず、リポジトリ内の
ドキュメントとして管理する。

## 記事ファイル

記事は `src/content/articles/*.md` に置く。ファイル名は記事 URL のスラッグになるため、
英小文字・数字・ハイフンだけを使用する。

例: `my-new-article.md` → `/articles/my-new-article/`

## 管理画面から追加する

1. `bun run dev` で開発サーバーを起動する
2. `/admin/` を開く
3. 「Work with Local Repository」でこのリポジトリを選択する
4. 記事を作成して保存する
5. 生成された Markdown をコミットして push する

エディタから Markdown を直接追加してもよい。

## Frontmatter

```yaml
---
title: 記事タイトル
description: 記事の概要
pubDate: 2026-07-08
updatedDate: 2026-07-14
tags:
  - astro
draft: false
---
```

- `title` と `pubDate` は必須
- `description` と `updatedDate` は省略可能
- `tags` は英小文字・数字・ハイフンで記述する
- `draft: true` の記事は本番ビルド・検索・RSSに含まれない

## 公開前の確認

```sh
bun run check
```

本文が一般訪問者向けの内容になっていること、内部の操作手順や秘密情報を含んでいないことも
確認する。

CI の Lighthouse ジョブはビルド結果から公開記事を自動検出するため、記事を追加・削除しても
`lighthouserc.json` を手動で変更する必要はない。
