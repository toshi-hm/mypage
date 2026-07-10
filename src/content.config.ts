import { file, glob } from "astro/loaders";
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

const works = defineCollection({
  // CMS(file collection)が {"works": [...]} 形式で保存するため、parser で配列を取り出す
  loader: file("src/content/works.json", {
    parser: (text) => (JSON.parse(text) as { works: Array<Record<string, unknown>> }).works,
  }),
  schema: z.object({
    id: z.string().regex(SLUG_PATTERN, "id は英数字ケバブケースのみ"),
    name: z.string().min(1),
    description: z.string().min(1),
    url: z.string().url().optional(),
    repo: z.string().url().optional(),
    tech: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
  }),
});

const career = defineCollection({
  // CMS(file collection)が {"career": [...]} 形式で保存するため、parser で配列を取り出す
  loader: file("src/content/career.json", {
    parser: (text) => (JSON.parse(text) as { career: Array<Record<string, unknown>> }).career,
  }),
  schema: z.object({
    id: z.string().regex(SLUG_PATTERN, "id は英数字ケバブケースのみ"),
    role: z.string().min(1),
    organization: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}$/, "startDate は YYYY-MM 形式"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "endDate は YYYY-MM 形式")
      .optional(),
    description: z.string().min(1),
    order: z.number().int().default(0),
  }),
});

export const collections = { articles, works, career };
