# Skill アイコン設計

## 目的

`/about` の Skill 一覧で略称ではなく、各技術のブランドアイコンを表示する。

## CDN 選定

- 基本のアイコンは、Simple Icons が公式に案内する jsDelivr の URL を利用する。
- URL は `simple-icons@v16` に固定し、最新版でアイコンが削除された場合の表示崩れを防ぐ。
- Simple Icons に収録されていない Playwright は Devicon の jsDelivr URL を利用し、`v2.17.0` に固定する。
- LIFF は LINE Front-end Framework のため、LINE のブランドアイコンを利用する。

## 表示・アクセシビリティ

- アイコンはスキル名に付随する装飾画像とし、空の `alt` と `aria-hidden` を指定する。
- `width` と `height` を指定してレイアウトシフトを防ぐ。
- 遅延読み込みにより、外部 CDN へのリクエストが初期表示を妨げないようにする。
- スキル名は従来どおりテキストで表示し、画像が取得できない場合も技術名を判別できるようにする。

## テスト

Astro Container API により、CDN URL、画像サイズ、遅延読み込み、装飾画像のアクセシビリティ属性、featured 表示を検証する。
