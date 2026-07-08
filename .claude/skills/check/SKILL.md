---
name: check
description: プロジェクトの全品質チェック(lint / format / markdown / typecheck / test / build)を実行し、失敗があれば修正する。コミット前・PR 作成前に必ず使う。
---

# 全チェック実行

## 手順

1. `bun run check` を実行する(lint → format:check → lint:md → typecheck → test → build の順で全チェックが走る)
2. 失敗したステップがあれば、以下の対応で修正して再実行する
   - `lint` 失敗: oxlint の指摘を修正。ルール自体が不適切な場合のみ `.oxlintrc.json` を調整
   - `format:check` 失敗: `bun run format` を実行して整形をコミットに含める
   - `lint:md` 失敗: markdownlint の指摘どおり Markdown を修正
   - `typecheck` 失敗: 型エラーを修正(`any` での回避は禁止)
   - `test` 失敗: テスト出力を読み、実装かテストの誤りを特定して修正
   - `build` 失敗: エラーメッセージに従って修正
3. すべて成功するまで繰り返す。成功したら Storybook にも影響がある変更なら `bun run build-storybook` も確認する

## 注意

- Node.js / npm は使わない。必ず Bun(`bun run`, `bunx`)で実行する
- チェックを飛ばしてのコミットは禁止
