import { getContainerRenderer } from "@astrojs/react/container-renderer";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { expect, test } from "vitest";
import BaseLayout from "../src/layouts/BaseLayout.astro";

test("OGP画像をX向け画像メタデータにも反映する", async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const result = await container.renderToString(BaseLayout, {
    props: {
      title: "Home",
      ogImage: "https://example.com/og.png",
    },
  });

  expect(result).toContain('<meta property="og:image" content="https://example.com/og.png"');
  expect(result).toContain('<meta name="twitter:image" content="https://example.com/og.png"');
});
