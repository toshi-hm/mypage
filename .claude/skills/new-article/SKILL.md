---
name: new-article
description: サイトに新しい記事を追加する。スラッグ規約・frontmatter スキーマに沿った Markdown を作成し、チェックまで行う。
---

# 記事追加

## 手順

1. スラッグを決める: 英数字ケバブケース(例: `my-first-post`)。日本語・大文字・アンダースコア不可
2. `src/content/articles/<slug>.md` を作成する:

   ```md
   ---
   title: 記事タイトル
   description: 一覧や meta に使う概要(省略時は本文冒頭から自動生成)
   pubDate: 2026-07-08
   tags:
     - tag1
   draft: false
   ---

   ## 最初の見出し

   本文。見出しは H2 から始める(H1 はレイアウトが出力する)。
   ```

3. `bun run dev` で `/articles/` と `/articles/<slug>/` の表示を確認する
4. `bun run check` を通す(スラッグ規約・スキーマ違反はここで検出される)

## CMS を使う場合

`bun run dev` を起動して <http://localhost:4321/admin/> を開き、「Work with Local Repository」でこのリポジトリを選択して編集する(Chrome/Edge)。保存すると同じ Markdown ファイルが書き込まれる。

## 注意

- frontmatter のスキーマは `src/content.config.ts` が正。フィールドを増やす場合は `public/admin/config.yml` も同期すること
- `draft: true` の記事は本番ビルドに含まれない
