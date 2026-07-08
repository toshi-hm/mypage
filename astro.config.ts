import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // TODO: デプロイ時に実際の URL へ変更する
  site: "https://mypage.example.com",
  integrations: [
    react(),
    sitemap({
      // 管理画面はクローラ導線から除外(robots.txt / noindex と三重の防御)
      filter: (page) => !new URL(page).pathname.startsWith("/admin/"),
    }),
  ],
});
