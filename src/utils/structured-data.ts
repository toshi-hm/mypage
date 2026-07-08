export interface WebSiteLdInput {
  name: string;
  description: string;
  url: string;
}

export interface BlogPostingLdInput {
  title: string;
  description: string;
  url: string;
  pubDate: Date;
  updatedDate?: Date | undefined;
  tags: string[];
  authorName: string;
}

/** トップページ用の WebSite JSON-LD を組み立てる */
export function buildWebSiteLd(input: WebSiteLdInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    description: input.description,
    url: input.url,
  };
}

/** 記事詳細用の BlogPosting JSON-LD を組み立てる */
export function buildBlogPostingLd(input: BlogPostingLdInput): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    datePublished: input.pubDate.toISOString(),
    author: {
      "@type": "Person",
      name: input.authorName,
    },
  };
  if (input.updatedDate) ld["dateModified"] = input.updatedDate.toISOString();
  if (input.tags.length > 0) ld["keywords"] = input.tags.join(",");
  return ld;
}
