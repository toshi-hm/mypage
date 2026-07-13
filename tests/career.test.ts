import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, test } from "vitest";
import CareerItem from "../src/components/molecules/CareerItem.astro";
import { formatPeriod, sortCareer } from "../src/utils/career";

const entry = (startDate: string, order: number) => ({ data: { startDate, order } });

describe("sortCareer", () => {
  test("order 降順 → 同値は startDate 降順で並ぶ(元配列は変更しない)", () => {
    const entries = [entry("2024-01", 1), entry("2025-01", 2), entry("2023-01", 2)];
    const sorted = sortCareer(entries);

    expect(sorted.map((e) => e.data.startDate)).toEqual(["2025-01", "2023-01", "2024-01"]);
    expect(entries.map((e) => e.data.startDate)).toEqual(["2024-01", "2025-01", "2023-01"]);
  });
});

describe("formatPeriod", () => {
  test("endDate があれば期間を表示する", () => {
    expect(formatPeriod("2024-04", "2025-12")).toBe("2024-04 〜 2025-12");
  });

  test("endDate がなければ「現在」を表示する", () => {
    expect(formatPeriod("2026-01")).toBe("2026-01 〜 現在");
  });
});

describe("CareerItem", () => {
  test("役割・組織・期間・説明を描画する", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(CareerItem, {
      props: {
        role: "ソフトウェアエンジニア",
        organization: "mypage",
        track: "work",
        startDate: "2026-01",
        description: "本サイトを設計・実装",
        highlights: ["React", "Bun"],
      },
    });

    expect(result).toContain("ソフトウェアエンジニア");
    expect(result).toContain("mypage");
    expect(result).toContain("2026-01 〜 現在");
    expect(result).toContain("本サイトを設計・実装");
    expect(result).toContain("React");
    expect(result).toContain("Bun");
  });
});
