# mypage

toshi-hm の個人ホームページ。Astro 7(静的出力)+ React islands 構成。将来 Cloudflare Workers (static assets) にデプロイ予定。

設計の詳細は [docs/design.md](./docs/design.md) を参照。

## 必要環境

- [Bun](https://bun.sh/) 1.x(Node.js / npm は使用しない)

## セットアップ

```sh
bun install
```

## 開発

```sh
bun run dev        # 開発サーバー http://localhost:4321
bun run storybook  # Storybook http://localhost:6006
```

## チェック

```sh
bun run check      # lint / format / markdown / typecheck / test / build を一括実行
```

個別実行:

| コマンド                                  | 内容              |
| ----------------------------------------- | ----------------- |
| `bun run lint`                            | oxlint            |
| `bun run format` / `bun run format:check` | oxfmt             |
| `bun run lint:md`                         | markdownlint-cli2 |
| `bun run typecheck`                       | astro check + tsc |
| `bun run test`                            | Vitest            |

## ビルドとプレビュー

```sh
bun run build       # dist/ に静的サイトを出力
bun run preview     # ビルド成果物をプレビュー
bun run preview:cf  # wrangler で Cloudflare 互換配信(dist/ が必要)
```
