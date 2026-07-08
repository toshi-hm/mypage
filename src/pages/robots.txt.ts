import type { APIRoute } from "astro";

// robots.txt を site 設定から動的に生成する(Sitemap は絶対 URL 必須のため)
export const GET: APIRoute = (context) => {
  const site = context.site ?? new URL("https://mypage.example.com");
  const body = [
    "User-agent: *",
    "Disallow: /admin/",
    "",
    `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
