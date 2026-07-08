# 概要

<!-- この PR で何を・なぜ変えるのか。関連する設計書(docs/design*.md)があればリンク -->

# 変更内容

-

# 確認方法

```sh
bun run check
```

<!-- UI 変更がある場合は bun run build && bun run lighthouse / bun run test:e2e の結果、スクリーンショットも添付 -->

# チェックリスト

- [ ] `bun run check` が通る
- [ ] UI・ページ構造の変更時: Lighthouse スコアの劣化がない(`bun run lighthouse`)
- [ ] ページ追加時: `tests/e2e/a11y.spec.ts` の対象一覧を見直した
- [ ] コンポーネント追加時: テスト(island は Storybook ストーリーも)を追加した
- [ ] 記事スキーマ変更時: `src/content.config.ts` と `public/admin/config.yml` を同期した
