import { describe, expect, it } from "vitest";
import { ageBetween } from "../src/lib/age-calculator";

describe("حاسبة العمر", () => {
  it("تحسب السنوات والأشهر والأيام بين تاريخين صحيحين", () => {
    expect(ageBetween("2000-01-15", "2026-08-26")).toEqual({ years: 26, months: 7, days: 11 });
  });
  it("تعالج الاقتراض من الشهر السابق عند الحاجة", () => {
    expect(ageBetween("2020-05-31", "2021-06-01")).toEqual({ years: 1, months: 0, days: 1 });
  });
  it("ترفض التاريخ غير الصحيح أو تاريخ مرجعي يسبق الميلاد", () => {
    expect(ageBetween("2024-02-30", "2025-01-01")).toBeNull();
    expect(ageBetween("2025-01-01", "2024-12-31")).toBeNull();
  });
});
