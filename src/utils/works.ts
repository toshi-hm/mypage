export interface WorkData {
  name: string;
  description: string;
  url?: string | undefined;
  repo?: string | undefined;
  tech: string[];
  featured: boolean;
  order: number;
}

/** order 昇順 → 同値は name 昇順で並べ替える */
export function sortWorks<T extends { data: Pick<WorkData, "order" | "name"> }>(entries: T[]): T[] {
  return entries.toSorted(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}
