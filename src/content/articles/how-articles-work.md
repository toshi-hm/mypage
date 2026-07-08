---
title: 記事の追加方法(CMS)
pubDate: 2026-07-08
tags:
  - meta
  - astro
---

このサイトの記事は Git ベースの CMS で管理しています。

## 仕組み

記事は `src/content/articles/*.md` に置いた Markdown ファイルです。
frontmatter は zod スキーマ(`src/content.config.ts`)で検証され、違反は CI で検出されます。

## 追加のしかた

1. `bun run dev` を起動して `/admin/` を開く(Sveltia CMS)
2. 「Work with Local Repository」でこのリポジトリを選ぶ
3. 記事を書いて保存すると Markdown ファイルとして書き込まれる
4. コミットして push すれば公開される(コードのリリース作業は不要)

エディタで直接 Markdown を書いても同じです。

## frontmatter の例

```yaml
title: 記事タイトル
description: 概要(省略可)
pubDate: 2026-07-08
tags:
  - astro
draft: false
```

コードブロックはサイトのライト/ダークテーマに追従してハイライトされます。
