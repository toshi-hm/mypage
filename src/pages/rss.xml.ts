import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { isPublishable, toFeedItems } from "../utils/articles";

export const GET: APIRoute = async (context) => {
  const articles = await getCollection("articles", ({ data }) =>
    isPublishable(data, import.meta.env.PROD),
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? "https://mypage.example.com",
    items: toFeedItems(articles),
    customData: "<language>ja</language>",
  });
};
