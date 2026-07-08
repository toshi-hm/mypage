# テスト規約

- テストは `tests/` 配下に `*.test.ts` / `*.test.tsx` で配置する
- `.astro` コンポーネント: Astro Container API(`experimental_AstroContainer`)でレンダリングし、HTML 出力をアサートする。デフォルトの `node` 環境で動く
- React island: `@testing-library/react` を使う。ファイル先頭に `// @vitest-environment happy-dom` を付けること
- 新しいコンポーネントを追加したら、必ず対応するテストを追加する
- island を追加・変更したら Storybook のストーリー(`*.stories.tsx`)も追加・更新する
- テストは実装の詳細ではなく、レンダリング結果とユーザーから見える振る舞いを検証する
- E2E は `tests/e2e/*.spec.ts`(Playwright)。クリティカルパスに限定し、網羅は単体テスト側で行う。実行は `bun run build && bun run test:e2e`
- ページを追加・変更したら `tests/e2e/a11y.spec.ts` の axe 対象ページ一覧を見直す
