# Cloudflare デプロイ準備 設計ドキュメント

Cloudflare Workers (static assets) への本番デプロイを「secrets を設定すれば動く」状態まで準備する。
**実デプロイは行わない**(Cloudflare アカウント連携はオーナーの作業)。

## 1. 構成

| 要素           | 内容                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| 配信           | `wrangler.jsonc` の `assets` で `dist/` を static assets 配信(構成済み・PR#1)                       |
| デプロイ手段   | GitHub Actions の手動トリガー(`workflow_dispatch`)ワークフロー `deploy.yml`                         |
| 設定の常時検証 | CI の build ジョブに `wrangler deploy --dry-run` を追加(認証不要で wrangler.jsonc とアセットを検証) |

### 設計判断

1. **デプロイは当面 `workflow_dispatch`(手動)のみ**
   main への push で自動デプロイにはしない。まず手動で数回デプロイして問題ないことを
   確認してから、自動化(`push: branches: [main]` の追加)を判断する
2. **secrets 未設定なら早期に分かりやすく fail**
   ワークフロー冒頭で `CLOUDFLARE_API_TOKEN` の存在を確認し、無ければ設定手順を表示して失敗させる
3. **dry-run を CI に常設**
   wrangler.jsonc の破壊や dist 構成の問題を、デプロイ時ではなく PR の時点で検出する

## 2. デプロイ手順(オーナー作業・初回のみ)

1. Cloudflare アカウントで API トークンを作成
   - テンプレート「Workers スクリプトを編集する」(Edit Cloudflare Workers)
2. GitHub リポジトリの Settings → Secrets and variables → Actions に登録
   - `CLOUDFLARE_API_TOKEN`: 上記トークン
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare ダッシュボードの Account ID
3. Actions タブ → `Deploy (Cloudflare Workers)` → `Run workflow`
4. デプロイ後、`https://mypage.<account>.workers.dev` で確認。独自ドメインは
   Cloudflare ダッシュボードの Workers ルート / カスタムドメインで設定
5. ドメイン確定後、`astro.config.ts` の `site` を実 URL に変更する(canonical / RSS /
   sitemap / robots がすべて追従する)

## 3. 将来の拡張(非スコープ)

- main マージ時の自動デプロイ(手動運用で安定を確認後)
- プレビューデプロイ(PR ごとの workers.dev プレビュー)
- CMS 本番ログイン用 GitHub OAuth プロキシ(`docs/design-articles.md` 参照)
