# コーディング規約

## TypeScript

- `strict` 前提(`astro/tsconfigs/strict` を継承)。`any` は使わない
- `noUnusedLocals` / `noUnusedParameters` が有効。未使用コードを残さない
- フォーマットは oxfmt に完全に委ねる。手動で整形スタイルを議論しない

## Astro / React の使い分け

- 静的な UI は必ず `.astro` で書く。JS を不要に出荷しない
- React island(`src/components/islands/`)は「ユーザー操作で状態が変わる部品」だけに使う
- island には最小の `client:*` ディレクティブを選ぶ(常時必要なら `client:load`、それ以外は `client:visible` / `client:idle`)

## スタイル

- 色・余白などのデザイントークンは `src/styles/global.css` の CSS カスタムプロパティを使う。ハードコードしない
- コンポーネント固有のスタイルは `.astro` のスコープ付き `<style>` に書く
- ダークテーマは `:root[data-theme="dark"]` で対応すること

## ツールの対象範囲(重要)

- oxlint / oxfmt は JS/TS/JSX/TSX/JSON/CSS/MD を対象とする。`.astro` ファイルは対象外
- `.astro` の品質は `astro check` と Vitest でカバーする
