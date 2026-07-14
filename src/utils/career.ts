export interface CareerData {
  role: string;
  organization: string;
  track: "education" | "work";
  startDate: string;
  endDate?: string | undefined;
  description: string;
  highlights: string[];
  order: number;
}

/** order 降順 → 同値は startDate 降順(新しい順)で並べ替える */
export function sortCareer<T extends { data: Pick<CareerData, "order" | "startDate"> }>(
  entries: T[],
): T[] {
  return entries.toSorted(
    (a, b) => b.data.order - a.data.order || b.data.startDate.localeCompare(a.data.startDate),
  );
}

/** 期間表示用の文字列を返す(終了日省略時は「現在」) */
export function formatPeriod(startDate: string, endDate?: string): string {
  return `${startDate} 〜 ${endDate ?? "現在"}`;
}
