import { describe, expect, it } from "vitest";
import { weekdayForGregorianDate } from "../src/lib/date-weekday";

describe("معرفة يوم الأسبوع من التاريخ الميلادي", () => {
  it("تعيد يوم الأسبوع من تاريخ UTC صحيح دون تأثير المنطقة الزمنية المحلية", () => {
    expect(weekdayForGregorianDate("2024-02-29")).toBe("الخميس");
    expect(weekdayForGregorianDate("2000-01-01")).toBe("السبت");
    expect(weekdayForGregorianDate("2026-08-27")).toBe("الخميس");
  });

  it("ترفض صيغ التواريخ غير الصحيحة والأيام غير الموجودة", () => {
    expect(weekdayForGregorianDate("2023-02-29")).toBeNull();
    expect(weekdayForGregorianDate("2024/02/29")).toBeNull();
    expect(weekdayForGregorianDate("" )).toBeNull();
  });
});
