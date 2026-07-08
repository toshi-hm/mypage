/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    // .astro コンポーネントは Container API を使うため node 環境で実行する。
    // React island のテストはファイル先頭の
    // `// @vitest-environment happy-dom` で個別に DOM 環境へ切り替える。
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
