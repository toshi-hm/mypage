# E2E テスト・アクセシビリティ自動検証 設計ドキュメント

実ブラウザでのユーザーフロー検証(E2E)と、アクセシビリティ違反の自動検出を CI に組み込む。

## 1. 目的とテストピラミッド上の位置づけ

- 単体テスト(Vitest)は「コンポーネント・純関数の振る舞い」を検証している
- Lighthouse CI は「スコア」を監視するが、**機能が壊れていないこと**は検証しない
- E2E は少数の**クリティカルパス**に絞り、実ブラウザで「ユーザーから見て動くこと」を保証する
  (数を増やしすぎない。網羅は単体テスト側の責務)

## 2. ツール選定

| ツール                         | 役割                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| Playwright(`@playwright/test`) | E2E ランナー。ビルド済みサイト(`astro preview`)に対して実行 |
| `@axe-core/playwright`         | 主要ページへの axe-core スキャン(WCAG 2.0/2.1 A・AA)        |

- 対象ブラウザは **Chromium のみ**(個人サイトの CI コストと得られる保証のバランス)
- **ビルド成果物に対して実行する**(`webServer: astro preview`)。dev サーバーではなく
  本番同等の出力を検証する

## 3. テストシナリオ(クリティカルパス)

| スペック             | 内容                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `navigation.spec.ts` | トップ → Articles → 記事詳細 → タグページの回遊。404 ページの表示     |
| `theme.spec.ts`      | テーマ切替が `data-theme` に反映され、**リロード後も永続**すること    |
| `search.spec.ts`     | `/search/` で検索語を入力すると Pagefind の結果が表示されること       |
| `a11y.spec.ts`       | 主要 5 ページ(/ /articles/ 記事詳細 /works/ /search/)で axe 違反 0 件 |

## 4. 実行環境

- ローカル: `bun run test:e2e`(要 `bun run build`)。Playwright 同梱ブラウザか、
  `PW_CHROMIUM_PATH` で任意の Chromium を指定可能
- CI: `e2e` ジョブを追加(`playwright install chromium --with-deps` → build → test)。
  失敗時は Playwright レポートを artifact 保存
- Vitest との住み分け: E2E は `tests/e2e/*.spec.ts`。Vitest の include
  (`tests/**/*.test.{ts,tsx}`)とは拡張子で分離し、二重実行を防ぐ

## 5. 非スコープ

- クロスブラウザ(WebKit / Firefox)マトリクス
- ビジュアルリグレッションテスト(スクリーンショット比較)
- 検索インデックスの内容網羅・CMS 管理画面の E2E
