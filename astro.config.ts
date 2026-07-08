import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // TODO: デプロイ時に実際の URL へ変更する
  site: "https://mypage.example.com",
  integrations: [react()],
});
