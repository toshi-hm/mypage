# UI 刷新・Lighthouse 最適化 設計ドキュメント

「AI が作った定型的な UI」から脱却した独自デザインへ刷新し、SEO / Lighthouse スコアを
最高水準に引き上げ、CI でスコアを継続監視する。

## 1. デザインコンセプト: 「活版インデックス」(editorial index)

紫グラデーション・角丸カード・絵文字多用といった「AI 生成 UI の定型」を避け、
**紙の索引・エディトリアルデザイン**をモチーフにする。

- **配色**: 温かみのある紙色の背景 + インクの黒 + クライン・ブルー 1 色のアクセント。
  ダークテーマは「夜のインク」(深い墨色 + 淡いブルー)。全て WCAG AA 以上のコントラスト
- **タイポグラフィ主導**: 見出しは `clamp()` による流体スケールの大型組み。
  日本語は `font-feature-settings: "palt"` で詰め組み。数字・日付は等幅(tabular-nums)
- **索引リスト**: カードの「箱」をやめ、罫線(上ボーダー)区切りの索引行スタイルに
- **セクション番号**: 「01 / Articles」のような通し番号ラベルで構造を見せる
- **縦書きアクセント**: ヒーローに `writing-mode: vertical-rl` のサイドラベル(純 CSS)
- **ページ遷移**: CSS のみの MPA View Transitions(`@view-transition`)。
  非対応ブラウザでは単に無効(プログレッシブエンハンスメント)。`prefers-reduced-motion` 尊重

### 制約(スコアを落とさないための決め事)

- **JS を 1 バイトも追加しない**(island は既存の ThemeToggle のみ)
- **Web フォントを使わない**(システムフォントスタック。CLS・転送量ゼロ)
- 画像・背景テクスチャを追加しない(装飾は罫線・タイポグラフィ・CSS のみで構成)

## 2. Lighthouse 監査対応

| 監査                                  | 対応                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| heading-order                         | カード見出しを `h3` → `h2` に変更(h1 → h3 のスキップ解消) |
| color-contrast                        | 全トークンを AA 以上で再設計(muted テキスト含む)          |
| tap-targets                           | ナビリンクにパディングを付与                              |
| focus-visible                         | `:focus-visible` の明示スタイルを追加                     |
| meta description / canonical / robots | 済(PR#3)。全ページで BaseLayout が出力                    |

## 3. Lighthouse CI(スコアのウォッチ)

- `@lhci/cli` を devDependencies に追加し、`lighthouserc.json` で設定
- `staticDistDir: dist`(LHCI 内蔵の静的サーバーで配信)で、固定ページと全公開記事を計測
- `bun run lighthouse:prepare` がビルド済みの `dist/articles/**/index.html` を検出し、
  `lighthouserc.json` の記事 URL を自動同期してから `oxfmt` で整形する。記事の追加・削除時に
  設定ファイルを手動更新する必要はない
- 各 URL を **3 回計測し median で評価**(共有ランナーの負荷ゆらぎを吸収)
- **アサーション(これを下回ると CI が fail)**
  - performance: `>= 0.9`
  - accessibility / best-practices / seo: `= 1.0`
- レポートは `filesystem` ターゲットで出力し、CI の artifact として保存(履歴を確認できる)
- CI に `lighthouse` ジョブを追加(build → URL 自動同期・整形 → `lhci autorun`)。GitHub Actions の
  ubuntu ランナー同梱の Chrome を使用
- ローカル実行: `bun run lighthouse`(要 `bun run build`。CHROME_PATH で任意の Chromium を指定可)

### スコア変動への方針

静的サイトかつ JS 極小のため performance はほぼ満点で安定する想定。閾値 0.9 は
「劣化の検知」が目的のハードゲート(満点固定にすると CI マシンの揺らぎで偽陽性になるため)。
実際、導入時の計測で GitHub Actions ランナー上の 1 回計測が 0.93 を記録したため、
3 回計測 median + 閾値 0.9 に調整した(ローカル実測は全 URL 100)。

## 4. テスト方針

- 既存テストはレンダリング内容(href・テキスト)を検証しており、スタイル刷新の影響なし。
  見出しレベル変更(h3→h2)はテストに影響しないことを確認
- スコア検証は Lighthouse CI が担う(ユニットテストではなく CI ゲート)

## 5. 非スコープ

- Web フォント・OGP 画像自動生成
- LHCI サーバー(履歴ダッシュボード)の常設。当面は CI artifact とジョブログで確認
