# mypage

Hama Toshiva の個人ホームページ。Astro 7(静的出力)+ React islands 構成で、将来 Cloudflare Workers (static assets) にデプロイする。設計の全体像は `docs/design.md` を参照。

## ランタイム

**Node.js / npm は使わない。すべて Bun で実行する**(`bun run`, `bun install`, `bunx`)。

## よく使うコマンド

| コマンド                          | 内容                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `bun run dev`                     | 開発サーバー (<http://localhost:4321>)                        |
| `bun run check`                   | 全チェック一括(lint / format / md / typecheck / test / build) |
| `bun run test`                    | Vitest 単体テスト                                             |
| `bun run test:coverage`           | カバレッジ付きテスト(閾値割れで fail。CI と同条件)            |
| `bun run test:e2e`                | Playwright E2E + axe(要 `bun run build`)                      |
| `bun run typecheck`               | `astro check` + `tsc --noEmit`                                |
| `bun run lint` / `bun run format` | oxlint / oxfmt                                                |
| `bun run lint:md`                 | markdownlint-cli2                                             |
| `bun run lighthouse`              | Lighthouse CI(要 `bun run build`。CI と同じ閾値で検証)        |
| `bun run storybook`               | Storybook (<http://localhost:6006>)                           |
| `bun run build-storybook`         | Storybook ビルド                                              |
| `bun run preview:cf`              | wrangler で `dist/` を Cloudflare 互換配信                    |

## アーキテクチャの要点

- ページ・レイアウト・静的コンポーネントは `.astro`(`src/pages`, `src/layouts`, `src/components`)
- インタラクティブな部品だけ React island(`src/components/islands/*.tsx`)として実装し、`client:*` ディレクティブで hydrate する
- テーマは `<html data-theme>` + CSS カスタムプロパティ(`src/styles/global.css`)で管理
- Storybook は React islands のみ対象(`storybook-astro` が Astro 7 未対応のため)
- `.astro` コンポーネントのテストは Vitest + Container API、islands は Testing Library + happy-dom
- 記事は `src/content/articles/*.md`(content collections)。スキーマは `src/content.config.ts`、CMS は `/admin/`(Sveltia CMS)。設計は `docs/design-articles.md` を参照

## 変更時の必須事項

- コミット前に `bun run check` を通すこと
- UI・ページ構造を変更したら `bun run build && bun run lighthouse` でスコア劣化がないことを確認する(CI でも検証される。閾値: perf >= 0.9、a11y / bp / seo = 1.0。3 回計測の median)
- デザインは「活版インデックス」テーマ(`docs/design-ui-lighthouse.md`)。JS・Web フォント・画像を安易に追加しない
- 詳細な規約は `.claude/rules/` を参照
