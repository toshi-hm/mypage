# カバレッジゲート・リポジトリ運用 設計ドキュメント

テストカバレッジの継続監視と、リポジトリ運用(依存更新・PR 品質)の仕組みを整備する。

## 1. カバレッジゲート(Vitest + v8)

- `bun run test:coverage` で計測。CI の test ジョブもカバレッジ付きで実行し、
  閾値割れで fail させる
- **計測対象はロジックを持つ層に限定**: `src/utils/**` と `src/components/islands/**`
  - `.astro` コンポーネント: Container API テストで検証しているが v8 計測の対象外
- **閾値**: statements 90 / branches 85 / functions 90 / lines 90
  (導入時実測: statements 97.5 / branches 92 / functions 100 / lines 98.5。
  閾値は「劣化検知」目的で実測より低めに置く — Lighthouse ゲートと同じ思想)
- HTML レポートを CI の artifact として保存

## 2. 依存更新の自動化(Dependabot)

- npm: 週次(月曜 9:00 JST)。**minor / patch はグループ化して 1 PR** にまとめ、
  major のみ個別 PR でレビューする
- github-actions: 週次。CI で使う action のバージョン追従
- すべての更新 PR は既存の CI(lint / typecheck / test+coverage / build / e2e /
  storybook / lighthouse)を通過しないとマージできない = 自動更新の安全網

## 3. PR 運用

- `.github/pull_request_template.md`: 概要・変更内容・確認方法・チェックリスト
  (`bun run check` / Lighthouse / axe 対象見直し / CMS スキーマ同期)を定型化
- `.github/CODEOWNERS`: 全ファイル @toshi-hm(将来コラボレーターが増えた際の下地)

## 4. 非スコープ

- コミットメッセージの機械検証(commitlint)。個人リポジトリでは規約(`.claude/rules/git-workflow.md`)運用で十分
- ビジュアルリグレッションテスト

## 5. バージョン方針(2026-07 監査)

- **npm 依存**: `bun outdated` で監査し、最新へ追従(以後は Dependabot が週次で追従)
  - **TypeScript は 6.x に据え置き**: TS 7(ネイティブコンパイラ)は `@astrojs/check` の
    peerDependencies が `^5 || ^6` のため未対応。対応後に移行する(据え置き理由を明記)
- **GitHub Actions**: Node.js 20 ランナーの廃止(2026-09)に伴い Node 24 対応版へ更新
  - `actions/checkout` v4 → **v7** / `actions/upload-artifact` v4 → **v7**
  - `oven-sh/setup-bun` は v2 が現行 major のまま
  - 以後は Dependabot(github-actions エコシステム)が週次で追従
