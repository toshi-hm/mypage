# 記事読書体験 設計ドキュメント

記事詳細ページの読みやすさ・回遊性を改善する。

## 1. 目的

- コードブロックをサイトのライト/ダークテーマに追従させる
- 記事詳細から前後の記事へ移動できるようにする

## 2. コードハイライトのテーマ対応

- Astro 組み込みの Shiki を **dual theme** 構成にする
  (`markdown.shikiConfig.themes = { light: "github-light", dark: "github-dark" }`)
- Shiki は両テーマの色を CSS 変数(`--shiki-dark` 等)としてインライン出力するため、
  `global.css` に `:root[data-theme="dark"]` で切り替えるルールを追加する
- 既存のテーマ機構(`<html data-theme>`)にそのまま追従し、JS 追加はゼロ

## 3. 前後記事ナビゲーション

- 記事詳細の下部に「← 新しい記事 / 古い記事 →」のナビを表示する
- 並び順は一覧と同じ pubDate 降順を正とする(newer = 一覧で1つ上、older = 1つ下)
- 隣接記事の決定は `getAdjacentArticles(entries, id)` を `src/utils/articles.ts` に
  純関数として実装し、`getStaticPaths` から props で渡す(純関数なので Vitest で直接テスト)
- draft 除外は既存の `isPublishable` フィルタを通した集合に対して行う
  (本番では draft を挟まない・dev では挟む、が自然に成立する)

## 4. テスト方針

- `getAdjacentArticles`: 先頭(newer なし)・末尾(older なし)・中間・1件のみ、の各ケース
- コードハイライトはビルド(CI)で Shiki の変換エラーを検出。表示は dev で目視確認

## 5. 非スコープ

- 目次(ToC)生成
- 関連記事(タグ類似度)
- コードブロックのコピーボタン
