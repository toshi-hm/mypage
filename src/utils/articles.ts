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

/** 日付を YYYY-MM-DD 形式で整形する */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
