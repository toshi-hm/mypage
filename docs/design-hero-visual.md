# ヒーロー演出(Three.js) 設計ドキュメント

トップページのヒーローに WebGL のリッチな演出を追加する。
**前提: PR#8 の Lighthouse ゲート(perf >= 0.9 / a11y・bp・seo = 1.0)を維持すること。**

## 1. 方式の選定

| 候補                   | 判断                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| **Three.js**(採用)     | エコシステム・保守性が高い。tree-shaking + 遅延ロードでコスト制御可能 |
| 素の WebGL シェーダ    | 最軽量(数 KB)だが保守性が低く、演出の発展性に乏しい                   |
| CSS アニメーションのみ | 「リッチな表示」の要求を満たさない                                    |

Three.js は初期バンドルに含めず、**アイドル時に動的 import** することで
Lighthouse の計測ウィンドウ(LCP / TBT)への影響を避ける。

## 2. 演出コンセプト: 「インクの粒子」

「活版インデックス」テーマに合わせ、**紙の上を漂うインクの粒子**をヒーロー背景に描く。

- 数百点の粒子(`THREE.Points` + カスタムシェーダ)がゆっくり漂い、ポインタに緩やかに反応
- 色はテーマの CSS 変数(`--color-accent` / `--color-text-muted`)から取得し、
  `data-theme` の変化(テーマ切替)を `MutationObserver` で検知して追従
- 派手なブルーム・グラデーションは使わない(テーマの品位を保つ)

## 3. パフォーマンス・アクセシビリティ予算(必須要件)

| 項目                     | 対応                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| 初期バンドル             | Three.js 本体は `import()` による遅延ロード。island 自体は数 KB                |
| ロードタイミング         | hydrate 後、`requestIdleCallback`(フォールバック `setTimeout`)まで遅延         |
| `prefers-reduced-motion` | reduce 時は WebGL を一切初期化しない(静的表示のまま)                           |
| タブ非表示               | `visibilitychange` でアニメーションループを停止                                |
| ビューポート外           | `IntersectionObserver` で停止                                                  |
| DPR                      | `min(devicePixelRatio, 2)` に制限                                              |
| WebGL 不可環境           | 初期化失敗時は静かにフォールバック(装飾なし)。`aria-hidden` で AT からも不可視 |
| 後始末                   | dispose / removeEventListener を確実に行う cleanup を返す                      |

## 4. 実装構成

- `src/components/islands/HeroVisual.tsx` — island(`client:visible`)。
  reduced-motion 判定・idle 待ち・cleanup 管理のみを担う薄いラッパー
- `src/lib/hero-scene.ts` — Three.js シーン本体(`mountHeroScene(el): cleanup`)。
  island から動的 import される(= Three.js がメインバンドルに入らない)
- `src/pages/index.astro` — ヒーローに背景レイヤーとして配置(`position: absolute`、本文の後ろ)

## 5. 検証

- `bun run build && bun run lighthouse` でスコア維持を実測(CI と同条件)
- Vitest: island が reduced-motion を尊重すること・コンテナが `aria-hidden` であること
- Storybook: HeroVisual のストーリーを追加(island 追加時の規約)

## 6. 非スコープ

- ヒーロー以外のページへの演出展開
- スクロール連動・ポストプロセッシング
