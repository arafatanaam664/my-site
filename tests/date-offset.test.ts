import { describe, expect, it } from "vitest";
import { dateWithDayOffset } from "../src/lib/date-offset";

describe("حاسبة تاريخ بعد عدد من الأيام", () => {
  it("تضيف أيامًا تقويمية عبر نهاية الشهر والسنة", () => {
    expect(dateWithDayOffset("2026-12-30", 3, "after")).toBe("2027-01-02");
  });

  it("تتعامل مع اليوم الكبيس عند الإضافة والطرح", () => {
    expect(dateWithDayOffset("2024-02-28", 1, "after")).toBe("2024-02-29");
    expect(dateWithDayOffset("2024-03-01", 1, "before")).toBe("2024-02-29");
  });

  it("ترفض التاريخ أو اتجاه العملية أو عدد الأيام غير الصالح", () => {
    expect(dateWithDayOffset("2026-02-30", 1, "after")).toBeNull();
    expect(dateWithDayOffset("2026-06-01", -1, "after")).toBeNull();
    expect(dateWithDayOffset("2026-06-01", 1.5, "after")).toBeNull();
    expect(dateWithDayOffset("2026-06-01", 1, "later" as "after")).toBeNull();
  });
});
