# Career(経歴)セクション 設計ドキュメント

`/about` にキャリア(職務経歴・活動歴)のタイムラインを追加する。ポートフォリオとして
「何を作ったか(Works)」に加えて「どう歩んできたか(Career)」を示す。

## 1. 目的

- 訪問者(採用担当・共同開発の打診など)が経歴を短時間で把握できるようにする
- Works / Articles と同様に **リリースなし**(データ編集のコミットのみ)で追加・更新できるようにする

## 2. データモデル

- データは `src/content/career.json`(単一 JSON ファイル)で管理し、Works と同じく
  Astro content collections の **file loader** で読み込む

| フィールド     | 型     | 必須              | 説明                                     |
| -------------- | ------ | ----------------- | ---------------------------------------- |
| `id`           | string | ✅                | 識別子(英数字ケバブケース)               |
| `role`         | string | ✅                | 役割・肩書き(例: ソフトウェアエンジニア) |
| `organization` | string | ✅                | 組織・プロジェクト名                     |
| `startDate`    | string | ✅                | 開始年月(`YYYY-MM`)                      |
| `endDate`      | string | -(省略時は在籍中) | 終了年月(`YYYY-MM`)。省略で「現在」表示  |
| `description`  | string | ✅                | 概要(1〜2 文)                            |
| `order`        | number | -(既定 `0`)       | 表示順(降順。同値は startDate 降順)      |

- zod スキーマ(`src/content.config.ts`)で検証し、違反は CI で検出
- Sveltia CMS にも **file collection** として登録し、`/admin/` から編集可能にする

## 3. 画面構成

- `/about` に「Career」セクションを追加(Skills の下、このサイトについて の上)
- `order` 降順 → 同値は `startDate` 降順(新しい順)で一覧表示
- 表示は縦のタイムライン風リスト(画像・JS 不要、`<style>` のみで装飾)

## 4. 実装構成

- `src/content.config.ts`: `career` コレクション追加(file loader)
- `src/content/career.json`: データ本体(サンプル 2 件)
- `src/utils/career.ts`: `sortCareer()`(order 降順 → startDate 降順、純関数)・`formatPeriod()`
- `src/components/CareerItem.astro`: 期間・役割・組織・説明を描画
- `src/pages/about.astro`: Career セクション追加
- `public/admin/config.yml`: career の file collection 追加

## 5. テスト方針

- `sortCareer` / `formatPeriod`: 単体テスト
- `CareerItem.astro`: Container API(期間表示・在籍中表示のアサート)
- `about.astro`: Container API で Career セクションの見出し・件数を確認
- スキーマ違反は `astro check` / build で CI 検出

## 6. 非スコープ

- 経歴の詳細ページ・タグ分類
- 画像(会社ロゴ等)の運用
