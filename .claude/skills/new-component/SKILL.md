---
name: new-component
description: 新しい UI コンポーネントを規約に沿って追加する(静的 .astro または React island)。テスト・ストーリーの追加までワンセットで行う。
---

# コンポーネント追加

## 判断基準

まず「ユーザー操作で状態が変わるか?」を判断する。

- **変わらない(静的)** → `.astro` コンポーネント
- **変わる(インタラクティブ)** → React island

## 静的コンポーネント (.astro)

1. `src/components/<Name>.astro` を作成
   - Props は frontmatter で `interface Props` として定義
   - スタイルはスコープ付き `<style>`、色は `var(--color-*)` トークンを使用
2. `tests/<name>.test.ts` を作成(Container API で `renderToString` した HTML をアサート)

## React island (.tsx)

1. `src/components/islands/<Name>.tsx` を作成(default export)
2. 使用側の `.astro` で `client:*` ディレクティブ付きで配置(必要最小のディレクティブを選ぶ)
3. `tests/<name>.test.tsx` を作成(先頭に `// @vitest-environment happy-dom`、Testing Library で振る舞いをテスト)
4. `src/components/islands/<Name>.stories.tsx` を作成(`Meta` / `StoryObj`、`tags: ["autodocs"]`)

## 仕上げ

- `bun run check` で全チェックを通す
- island の場合は `bun run build-storybook` も通ることを確認する
