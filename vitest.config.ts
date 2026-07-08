/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    // .astro コンポーネントは Container API を使うため node 環境で実行する。
    // React island のテストはファイル先頭の
    // `// @vitest-environment happy-dom` で個別に DOM 環境へ切り替える。
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // ロジックを持つ層(utils / islands)を計測対象にする。
      // .astro は Container API テストでカバーするが v8 計測の対象外、
      // hero-scene.ts は WebGL 依存で実行環境がないため除外(E2E とフォールバックで担保)
      include: ["src/utils/**", "src/components/islands/**"],
      exclude: ["**/*.stories.tsx"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
      reporter: ["text", "html"],
    },
  },
});
