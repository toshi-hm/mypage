# 記事機能(CMS)設計ドキュメント

PR#1 の基盤(`docs/design.md`)の上に、CMS 形式で記事を追加できる仕組みを構築するための設計書。

## 1. 要件

- CMS 形式(管理画面)で記事を追加・編集できる
- **リリースなしで記事を追加できる**: アプリのコード変更・リリース作業なしに、記事の追加(= コンテンツのコミット)だけで公開される
- ローカルで完結して動作確認できる(外部アカウント・API キー不要)
- 既存の品質ゲート(`bun run check` / CI green)を維持する

### 「リリースなし」の定義

「記事を追加するたびにアプリのコード変更やバージョンアップ(リリース作業)をしない」こと。
記事は Markdown のコミットのみで追加され、CI が自動でビルドする(将来はデプロイまで自動化)。
ビルドレス(SSR で外部 CMS から都度取得)という意味ではない。

## 2. 方式の比較と選定

|                           | 案A: Git ベース CMS(採用)                | 案B: 外部ヘッドレス CMS + SSR |
| ------------------------- | ---------------------------------------- | ----------------------------- |
| 記事の保存先              | リポジトリ内 Markdown                    | 外部サービス(microCMS 等)     |
| 外部アカウント / API キー | 不要                                     | 必要(現時点で存在しない)      |
| アーキテクチャ            | 静的出力を維持                           | SSR 化(ADR 1 を覆す)          |
| ローカル動作確認          | 完全に可能                               | モックが必要                  |
| CI 検証                   | スキーマ・ビルド・テスト全て可能         | シークレット依存              |
| 反映までの流れ            | コミット → CI ビルド →(将来)自動デプロイ | 即時                          |

**案A を採用**。理由: 外部依存ゼロでローカル最優先の方針に合致し、静的出力の ADR を維持でき、
CI ですべて検証できる。個人サイトで数分のビルド遅延は問題にならない。

### CMS の選定: Sveltia CMS

| 候補                  | 判断                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Sveltia CMS**(採用) | Decap 互換設定の現行世代 CMS。**ローカルリポジトリ編集がプロキシ不要**(File System Access API)。npm パッケージを同梱でき CDN 依存なし |
| Decap CMS             | ローカル編集に `decap-server` プロキシが必要。開発は低調                                                                              |
| TinaCMS               | Tina Cloud アカウントまたはセルフホストバックエンドが必要で過剰                                                                       |

Sveltia CMS は `@sveltia/cms` を dependencies に pin し、`/admin` ページで Vite バンドルして同梱する
(外部 CDN を参照しない)。

## 3. コンテンツモデル

コレクション: `articles`(`src/content/articles/*.md`、Astro content collections + glob loader)

| フィールド    | 型       | 必須            | 説明                                                |
| ------------- | -------- | --------------- | --------------------------------------------------- |
| `title`       | string   | ✅              | 記事タイトル                                        |
| `description` | string   | -               | 概要。未指定時は本文冒頭から自動生成(一覧・meta 用) |
| `pubDate`     | date     | ✅              | 公開日                                              |
| `updatedDate` | date     | -               | 更新日                                              |
| `tags`        | string[] | -(既定 `[]`)    | タグ                                                |
| `draft`       | boolean  | -(既定 `false`) | `true` なら本番ビルドから除外(dev では表示)         |

- 画像フィールドは今回追加しない(YAGNI)。CMS のメディア置き場だけ `public/images/articles/` に確保
- スキーマは `src/content.config.ts` に zod で定義し、違反はビルドエラーとして CI で検出

## 4. URL・スラッグ規約

- 記事 URL: `/articles/<slug>/`、一覧: `/articles/`
- スラッグ = ファイル名(拡張子除く)。**英数字ケバブケース必須**: `^[a-z0-9]+(-[a-z0-9]+)*$`
- 日本語スラッグは不許可(URL 共有・OGP・配信での事故防止)。日付はファイル名でなく `pubDate` で管理
- 規約はテストで強制し、違反ファイルは CI で fail させる

## 5. 画面構成

| パス                | 内容                                              |
| ------------------- | ------------------------------------------------- |
| `/articles/`        | 記事一覧(pubDate 降順、draft 除外)                |
| `/articles/<slug>/` | 記事詳細(Markdown レンダリング、タグ・日付表示)   |
| `/admin/`           | Sveltia CMS 管理画面(検索エンジン非対象: noindex) |
| `/`(既存)           | 最新記事 3 件のダイジェストを追加                 |

Header のナビに「Articles」を追加する。

## 6. CMS 運用フロー

### ローカル(現在)

1. `bun run dev` を起動し <http://localhost:4321/admin/> を開く
2. 「Work with Local Repository」でリポジトリのフォルダを選択(Chrome/Edge の File System Access API)
3. 管理画面で記事を作成・保存 → `src/content/articles/*.md` に直接書き込まれる
4. dev サーバーが即時反映。確認後、通常の git フローでコミット & push

エディタで直接 `.md` を書いても同じ(CMS はあくまで UI の一つ)。

### 本番(将来・デプロイ後)

1. `/admin/` を開き GitHub でログイン(要 OAuth プロキシ: Cloudflare Workers に 1 ファイル。**本 PR 非スコープ**)
2. 記事を保存すると GitHub にコミットされる
3. CI が自動ビルド → 自動デプロイ(deploy ジョブは将来 PR)

## 7. 実装構成

```text
src/
├── content.config.ts            # articles コレクション定義(zod スキーマ)
├── content/articles/*.md        # 記事本体(サンプル: 公開2件 + draft 1件)
├── pages/
│   ├── articles/index.astro     # 一覧
│   ├── articles/[slug].astro    # 詳細(getStaticPaths + render)
│   └── admin/index.astro        # Sveltia CMS(@sveltia/cms を bundle)
├── components/ArticleCard.astro # 一覧カード
└── utils/articles.ts            # isPublishable / excerpt / formatDate

public/admin/config.yml          # CMS 設定(コレクション定義と対応)
public/images/articles/          # CMS メディア置き場
```

## 8. テスト方針

- `utils/articles.ts`: draft 除外判定・抜粋生成・日付整形の単体テスト
- スラッグ規約: `src/content/articles/` のファイル名が正規表現に合致することをテストで強制
- `ArticleCard.astro`: Container API でレンダリング内容をテスト
- ビルド検証: サンプル記事(draft 含む)込みで `astro build` が通り、draft が出力されないこと(CI の build ジョブで担保)

## 9. 非スコープ(今回)

- GitHub OAuth プロキシ(本番 CMS ログイン用)→ デプロイフェーズで追加
- 実デプロイ・自動デプロイ
- RSS / OGP 画像生成 / 記事内画像運用の整備
- タグ別一覧ページ
