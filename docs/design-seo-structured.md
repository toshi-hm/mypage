# 構造化データ・関連記事・a11y 強化 設計ドキュメント

検索エンジンへの意味づけ(JSON-LD)と記事間の回遊性、キーボード操作の快適さを強化する。
Lighthouse ゲート(perf >= 0.9 / a11y・bp・seo = 1.0)の維持が前提。

## 1. JSON-LD 構造化データ

- `BaseLayout` に任意の `jsonLd` prop を追加し、`<script type="application/ld+json">` として出力
- トップページ: `WebSite`(サイト名・URL・説明)
- 記事詳細: `BlogPosting`(headline / datePublished / dateModified / keywords / author)
- 生成ロジックは `src/utils/structured-data.ts` の純関数に分離し Vitest でテスト
  - `buildWebSiteLd(site)` / `buildBlogPostingLd(input)`
- JSON-LD は表示に影響せず、Lighthouse SEO / リッチリザルトの下地になる

## 2. 関連記事

- 記事詳細の下部に「関連記事」を最大 3 件表示
- 選定は **タグ共起数**(共有タグが多い順)→ 同数なら pubDate 降順。共有タグ 0 件は出さない
- `relatedArticles(entries, currentId, max)` を `src/utils/articles.ts` に純関数で実装しテスト
- draft 除外済みの集合(既存フィルタ)に対して計算する

## 3. スキップリンク(a11y)

- `BaseLayout` の先頭に「本文へスキップ」リンクを追加し、`<main id="main">` へ飛ばす
- 通常は視覚的に隠し、キーボードフォーカス時のみ表示(`:focus` で出現)
- ナビゲーションをタブ移動で通過する手間を省く(WCAG 2.4.1 Bypass Blocks)

## 4. テスト方針

- `buildWebSiteLd` / `buildBlogPostingLd`: スキーマの主要フィールドを検証
- `relatedArticles`: 共起数順・同数時の日付順・共有 0 件の除外・自分自身の除外
- スキップリンク: BaseLayout は island を含むため Container 単体テストは行わず、
  ビルド出力(CI)と Lighthouse(a11y = 1.0 維持)で検証

## 5. 非スコープ

- OGP 画像の自動生成(ビルド時フォントレンダリングが必要。将来 PR)
- BreadcrumbList / FAQ 等の追加スキーマ
