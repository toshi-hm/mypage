# Git 運用ルール

- `main` に直接コミットしない。作業ブランチ → PR → CI green → マージ
- コミット前に `bun run check` を通す(lint / format / md / typecheck / test / build)
- コミットメッセージは Conventional Commits 形式(`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:` など)
- `bun.lock` は必ずコミットする。CI は `bun install --frozen-lockfile` で検証される
- 依存追加は `bun add` / `bun add -d` を使う(package.json の手編集より優先)
- 生成物(`dist/`, `storybook-static/`, `.astro/`)はコミットしない
