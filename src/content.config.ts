import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { SLUG_PATTERN } from "./utils/articles";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // タグは URL(/tags/<tag>/)になるため、スラッグと同じ英数字ケバブケースを強制する
    tags: z.array(z.string().regex(SLUG_PATTERN, "タグは英数字ケバブケースのみ")).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
