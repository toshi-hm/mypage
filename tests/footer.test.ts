import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import Footer from "../src/components/organisms/SiteFooter.astro";

test("コピーライトに現在の年を表示する", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer);

  expect(result).toContain(`${new Date().getFullYear()} Hama Toshiya`);
  expect(result).toContain("https://github.com/toshi-hm");
  expect(result).toContain("https://www.linkedin.com/in/toshiyahama");
});
