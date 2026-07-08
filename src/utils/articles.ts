export interface ArticleData {
  title: string;
  description?: string | undefined;
  pubDate: Date;
  updatedDate?: Date | undefined;
  tags: string[];
  draft: boolean;
}

/** スラッグ規約: 英数字ケバブケースのみ許可(日本語スラッグは不可) */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** draft 記事は本番ビルドから除外する。dev では表示する */
export function isPublishable(data: Pick<ArticleData, "draft">, isProd: boolean): boolean {
  return !(isProd && data.draft);
}

/**
 * 一覧・meta 用の概要を返す。
 * description があればそれを、なければ本文から Markdown 記法を除いた冒頭を切り出す。
 */
export function excerpt(
  data: Pick<ArticleData, "description">,
  body: string | undefined,
  maxLength = 120,
): string {
  if (data.description) return data.description;
  if (!body) return "";

  const plain = body
    // コードブロック・インラインコードを除去
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    // 画像・リンクはラベルだけ残す
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // 見出し・引用・強調などの記号を除去
    .replace(/^[#>\s-]+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
}

/** pubDate 降順(新しい順)で並べ替える */
export function sortByPubDateDesc<T extends { data: Pick<ArticleData, "pubDate"> }>(
  entries: T[],
): T[] {
  return entries.toSorted((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export interface FeedItem {
  title: string;
  pubDate: Date;
  description: string;
  link: string;
}

/**
 * RSS フィード項目を組み立てる。pubDate 降順に並べ、
 * description は excerpt(description → 本文抜粋)を使う。
 */
export function toFeedItems(
  entries: Array<{ id: string; data: ArticleData; body?: string | undefined }>,
): FeedItem[] {
  return sortByPubDateDesc(entries).map((entry) => ({
    title: entry.data.title,
    pubDate: entry.data.pubDate,
    description: excerpt(entry.data, entry.body),
    link: `/articles/${entry.id}/`,
  }));
}

export interface TagCount {
  tag: string;
  count: number;
}

/** タグを集計して返す(count 降順 → 同数はタグ名昇順) */
export function collectTags(entries: Array<{ data: Pick<ArticleData, "tags"> }>): TagCount[] {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export interface AdjacentArticles<T> {
  /** 1 つ新しい記事(pubDate 降順の一覧で 1 つ上) */
  newer: T | undefined;
  /** 1 つ古い記事(pubDate 降順の一覧で 1 つ下) */
  older: T | undefined;
}

/**
 * pubDate 降順に並べたうえで、指定 id の前後の記事を返す。
 * 対象 id が見つからない場合はどちらも undefined。
 */
export function getAdjacentArticles<T extends { id: string; data: Pick<ArticleData, "pubDate"> }>(
  entries: T[],
  id: string,
): AdjacentArticles<T> {
  const sorted = sortByPubDateDesc(entries);
  const index = sorted.findIndex((entry) => entry.id === id);
  if (index === -1) return { newer: undefined, older: undefined };
  return { newer: sorted[index - 1], older: sorted[index + 1] };
}

/**
 * タグ共起数ベースの関連記事を返す(共有タグ数降順 → pubDate 降順)。
 * 自分自身と共有タグ 0 件の記事は含めない。
 */
export function relatedArticles<
  T extends { id: string; data: Pick<ArticleData, "tags" | "pubDate"> },
>(entries: T[], currentId: string, max = 3): T[] {
  const current = entries.find((entry) => entry.id === currentId);
  if (!current) return [];
  const currentTags = new Set(current.data.tags);

  return entries
    .filter((entry) => entry.id !== currentId)
    .map((entry) => ({
      entry,
      shared: entry.data.tags.filter((tag) => currentTags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .toSorted(
      (a, b) =>
        b.shared - a.shared || b.entry.data.pubDate.getTime() - a.entry.data.pubDate.getTime(),
    )
    .slice(0, max)
    .map(({ entry }) => entry);
}

/** 日付を YYYY-MM-DD 形式で整形する */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
