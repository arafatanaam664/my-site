import { describe, expect, it } from "vitest";
import { alAdhanUrl, parseUmmAlQura } from "../src/lib/server/umm-al-qura";

describe("تحويل أم القرى الخادمي", () => {
  it("يتحقق من طريقة HJCoSA ويطبع استجابة المصدر اللازمة", () => {
    const url = alAdhanUrl({ day: "25", month: "08", year: "2026" });
    expect(parseUmmAlQura({ code: 200, data: { hijri: { day: "12", year: "1448", weekday: { ar: "الثلاثاء" }, month: { ar: "ربيع الأول" }, method: "HJCoSA" }, gregorian: { day: "25", year: "2026", month: { number: 8 }, weekday: { en: "Tuesday" } } } }, url, "2026-08-25T00:00:00Z")).toMatchObject({ hijri: { day: "12", year: "1448", method: "HJCoSA" }, gregorian: { month: "08" }, sourceUrl: url });
  });

  it("يرفض استجابة بلا طريقة أم القرى", () => {
    expect(parseUmmAlQura({ code: 200, data: { hijri: { day: "1", year: "1448", weekday: { ar: "الأحد" }, month: { ar: "محرم" }, method: "OTHER" }, gregorian: { day: "1", year: "2026", month: { number: 1 } } } }, "https://example.test")).toBeNull();
  });
});
