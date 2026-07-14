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
    // href に直接展開されるため、javascript: 等のスキームを排除し http(s) のみ許可する
    url: z
      .string()
      .url()
      .refine((u) => /^https?:\/\//i.test(u), "http(s) の URL のみ許可")
      .optional(),
    repo: z
      .string()
      .url()
      .refine((u) => /^https?:\/\//i.test(u), "http(s) の URL のみ許可")
      .optional(),
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
    track: z.enum(["education", "work"]),
    startDate: z.string().regex(/^\d{4}-\d{2}$/, "startDate は YYYY-MM 形式"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "endDate は YYYY-MM 形式")
      .optional(),
    description: z.string().min(1),
    highlights: z.array(z.string().min(1)).default([]),
    order: z.number().int().default(0),
  }),
});

export const collections = { articles, works, career };
