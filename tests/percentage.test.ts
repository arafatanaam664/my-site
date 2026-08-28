import { describe, expect, it } from "vitest";
import { percentChange, percentOf, ratioToPercent } from "../src/lib/percentage";

describe("حاسبة النسبة", () => {
  it("تحسب قيمة النسبة والنسبة بين رقمين ونسبة التغير", () => {
    expect(percentOf(10, 200)).toBe(20);
    expect(ratioToPercent(25, 200)).toBe(12.5);
    expect(percentChange(100, 130)).toBe(30);
  });

  it("ترفض القسمة على صفر والقيم غير العددية", () => {
    expect(ratioToPercent(1, 0)).toBeNull();
    expect(percentChange(0, 10)).toBeNull();
    expect(percentOf(Number.NaN, 10)).toBeNull();
  });
});
