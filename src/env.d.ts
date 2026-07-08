/// <reference types="astro/client" />

// tsc(エディタ外)で .ts テストから .astro をインポートするための宣言。
// astro check は言語サーバー側で解決するため、この宣言は tsc --noEmit 用。
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}
