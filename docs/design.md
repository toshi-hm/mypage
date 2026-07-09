# mypage 設計ドキュメント

個人ホームページ(HP)を構築し、最終的に Cloudflare にデプロイするためのプロジェクト設計書。

## 1. 目的とスコープ

- 自分のプロフィール・活動を紹介する静的な個人ホームページを作る
- ローカルで開発・確認できる状態を最優先で整備する(デプロイは後続フェーズ)
- CI で品質チェック(lint / format / typecheck / test / build)を自動化する

### 非スコープ(現時点)

- Cloudflare への実デプロイ(設定・手順の準備のみ行う)
- DB などの動的バックエンド(記事は Git ベース CMS で管理する。`docs/design-articles.md` 参照)
- 多言語対応

## 2. 技術選定

| 領域                   | 採用技術                           | バージョン                     | 選定理由                                                                                      |
| ---------------------- | ---------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| フレームワーク         | Astro                              | 7.x                            | コンテンツ中心サイトに最適。ゼロJSデフォルトで高速。静的出力で Cloudflare にそのまま載る      |
| 言語                   | TypeScript                         | 6.x                            | 型安全。`strict` 前提                                                                         |
| ランタイム / PM        | Bun                                | 1.x                            | 高速なインストール・スクリプト実行。Node.js は使わない                                        |
| UI islands             | React                              | 19.x                           | インタラクティブ部品(テーマ切替等)に限定して使用。Storybook 公式サポートがあるため採用        |
| Lint                   | oxlint                             | 1.x                            | Rust 製で高速。ESLint 代替                                                                    |
| Format                 | oxfmt                              | 0.x                            | Rust 製 formatter。JS/TS/JSX/TSX を対象                                                       |
| Markdown lint          | markdownlint-cli2                  | 0.x                            | oxlint/oxfmt が対象としない Markdown を補完                                                   |
| Typecheck              | astro check + tsc                  | -                              | `.astro` 含むプロジェクト全体の型検査                                                         |
| 単体テスト             | Vitest                             | 4.x                            | Vite ネイティブ。Astro の `getViteConfig()` で統合                                            |
| コンポーネントカタログ | Storybook                          | 10.x (`@storybook/react-vite`) | React islands のカタログ・ドキュメント化                                                      |
| デプロイ先(予定)       | Cloudflare Workers (static assets) | -                              | `wrangler` で `dist/` を配信。Pages ではなく Workers の静的アセット配信を採用(現行の推奨パス) |

### 設計判断の記録 (ADR 要約)

1. **静的出力(`output: 'static'`)を採用**
   個人 HP に SSR は不要。`@astrojs/cloudflare` アダプタは導入せず、ビルド成果物 `dist/` を
   Cloudflare Workers の static assets として配信する。SSR が必要になったらアダプタを追加する。
2. **Storybook は React islands に限定**
   コミュニティの `storybook-astro` は Astro ^4〜^6 のみ対応で Astro 7 では使えない(2026-07 時点)。
   そのため Storybook 公式サポートのある React (`@storybook/react-vite`) を採用し、
   インタラクティブなコンポーネントを React island として実装・カタログ化する。
   `.astro` コンポーネントのカタログ化は行わず、Vitest の Container API でテストする。
3. **oxlint / oxfmt は JS/TS 系ファイルのみ対象**
   `.astro` ファイルのフロントマターは対象外(ツール側が未対応)。`.astro` の品質は
   `astro check`(型検査)と Vitest でカバーする。Markdown は markdownlint-cli2 が担当。
4. **ランタイムは Bun に統一**
   ローカル・CI ともに `bun` / `bunx` を使用。lockfile は `bun.lock`(テキスト形式)。

## 3. アーキテクチャ

```text
┌────────────────────────────────────────────┐
│ Astro 7 (output: static)                   │
│                                            │
│  src/pages/*.astro      … ルーティング       │
│  src/layouts/*.astro    … 共通レイアウト     │
│  src/components/*.astro … 静的コンポーネント  │
│  src/components/islands/*.tsx               │
│    … React islands (client:load 等)         │
└──────────────┬─────────────────────────────┘
               │ astro build (bun)
               ▼
            dist/  ──(将来)──▶  Cloudflare Workers static assets
```

- ページ・レイアウトは `.astro`。JS を出荷しない
- インタラクションが必要な箇所だけ React island(`client:*` ディレクティブ)で hydrate
- スタイルは Astro のスコープ付き `<style>` + `src/styles/global.css`(CSS カスタムプロパティでテーマ管理)

## 4. ディレクトリ構成

```text
.
├── .claude/                 # Claude Code 設定
│   ├── settings.json        # hooks / permissions
│   ├── rules/               # コーディング規約等のルール
│   └── skills/              # プロジェクト固有スキル
├── .github/workflows/ci.yml # CI 定義
├── .storybook/              # Storybook 設定
├── docs/
│   └── design.md            # 本ドキュメント
├── public/                  # 静的アセット(そのまま配信)
├── src/
│   ├── components/          # .astro コンポーネント
│   │   └── islands/         # React islands (.tsx)
│   ├── layouts/             # BaseLayout など
│   ├── pages/               # ルーティング (index, about, ...)
│   ├── styles/              # global.css
│   └── content/             # (将来) content collections
├── tests/                   # Vitest 単体テスト
├── astro.config.ts
├── vitest.config.ts
├── tsconfig.json
├── .oxlintrc.json
├── .markdownlint-cli2.jsonc
├── wrangler.jsonc           # Cloudflare 配信設定(デプロイ準備)
├── CLAUDE.md
└── package.json
```

## 5. ページ構成(初期)

| パス     | 内容                                             |
| -------- | ------------------------------------------------ |
| `/`      | トップ。ヒーロー + 自己紹介ダイジェスト + リンク |
| `/about` | プロフィール詳細・スキル・経歴                   |
| `/404`   | Not Found ページ                                 |

共通要素: `Header`(ナビ + テーマ切替 island)、`Footer`、`BaseLayout`(meta / OGP / テーマ初期化スクリプト)。

## 6. ツールチェーンとスクリプト

| スクリプト                | コマンド                      | 役割                                 |
| ------------------------- | ----------------------------- | ------------------------------------ |
| `bun run dev`             | `astro dev`                   | 開発サーバー                         |
| `bun run build`           | `astro build`                 | 本番ビルド → `dist/`                 |
| `bun run preview`         | `astro preview`               | ビルド成果物のプレビュー             |
| `bun run preview:cf`      | `wrangler dev`                | Cloudflare 互換環境で `dist/` を配信 |
| `bun run lint`            | `oxlint`                      | Lint                                 |
| `bun run format`          | `oxfmt`                       | フォーマット(書き込み)               |
| `bun run format:check`    | `oxfmt --check`               | フォーマット検査                     |
| `bun run lint:md`         | `markdownlint-cli2`           | Markdown lint                        |
| `bun run typecheck`       | `astro check && tsc --noEmit` | 型検査                               |
| `bun run test`            | `vitest run`                  | 単体テスト                           |
| `bun run storybook`       | `storybook dev -p 6006`       | Storybook 開発サーバー               |
| `bun run build-storybook` | `storybook build`             | Storybook ビルド                     |
| `bun run check`           | 上記チェックの一括実行        | ローカル / CI 共通ゲート             |

### テスト方針

- `.astro` コンポーネント: Astro **Container API**(`experimental_AstroContainer`)で
  HTML にレンダリングし、出力をアサートする(environment: `node`)
- React islands: `@testing-library/react` + `happy-dom` で描画・操作をテスト
- テストは `tests/` 配下に `*.test.ts(x)` で配置

## 7. CI 設計 (GitHub Actions)

`push`(main)と `pull_request` で起動。すべて Bun ベース(`oven-sh/setup-bun@v2`)。

```text
ci.yml
├── lint        : oxlint / oxfmt --check / markdownlint-cli2
├── typecheck   : astro check + tsc --noEmit
├── test        : vitest run
├── build       : astro build(dist/ を artifact 保存)
└── storybook   : storybook build
```

- ジョブは並列実行。すべて成功で green
- 依存インストールは `bun install --frozen-lockfile` で lockfile を厳守

## 8. デプロイ計画(後続フェーズ)

1. `wrangler.jsonc` の `assets` 設定で `dist/` を static assets として配信(準備済み)
2. デプロイワークフロー(`workflow_dispatch`)と CI での `wrangler deploy --dry-run` 検証は準備済み。
   secrets 設定と手順は `docs/design-deploy.md` を参照
3. CMS(`/admin`)の本番ログイン用 GitHub OAuth プロキシを Cloudflare Workers に追加(`docs/design-articles.md` 参照)
4. 手動デプロイの安定を確認後、main マージ時の自動デプロイ化を判断

## 9. 開発支援 (Claude Code)

- `CLAUDE.md`: プロジェクト概要・コマンド・規約の入口
- `.claude/rules/`: コーディング規約 / テスト規約 / git 運用ルール
- `.claude/skills/`: `check`(全チェック実行)などのプロジェクトスキル
- hooks:
  - `SessionStart`: 依存が未インストールなら `bun install`
  - `PostToolUse`(Edit/Write): 編集した JS/TS ファイルに `oxfmt` を自動適用
