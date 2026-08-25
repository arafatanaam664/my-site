import { describe, expect, it } from "vitest";
import { dateDifferenceDays } from "../src/lib/date-difference";

describe("حاسبة فرق الأيام", () => {
  it("تحسب الفرق عبر نهاية الشهر والسنة بتوقيت UTC", () => {
    expect(dateDifferenceDays("2026-12-31", "2027-01-02")).toBe(2);
    expect(dateDifferenceDays("2026-01-02", "2026-01-01")).toBe(1);
  });
  it("ترفض صيغة تاريخ أو يومًا غير صالح", () => {
    expect(dateDifferenceDays("2026-02-30", "2026-03-01")).toBeNull();
    expect(dateDifferenceDays("bad", "2026-03-01")).toBeNull();
  });
});
