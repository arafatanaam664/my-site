import { describe, expect, it } from "vitest";
import { formatIso, gregorianToHijri, gregorianToJdn, hijriToGregorian, hijriToGregorianIso, jdnToGregorian } from "../src/lib/hijri-calendar";

describe("التقويم الهجري المدني", () => {
  it("يحول يوم جوليان المعروف لـ 1 يناير 2000", () => {
    expect(gregorianToJdn(2000, 1, 1)).toBe(2451545);
    expect(jdnToGregorian(2451545)).toEqual({ year: 2000, month: 1, day: 1 });
  });

  it("يجعل 19 يوليو 622 بداية السنة الهجرية الأولى", () => {
    expect(gregorianToHijri("0622-07-19")).toMatchObject({ year: 1, month: 1, day: 1, monthName: "محرم" });
    expect(hijriToGregorian(1, 1, 1)).toEqual({ year: 622, month: 7, day: 19 });
  });

  it("يعيد التحويل ذهابًا وإيابًا لتواريخ صحيحة ويرفض المدخلات الباطلة", () => {
    const iso = "2026-08-28";
    const hijri = gregorianToHijri(iso);
    expect(hijri).not.toBeNull();
    expect(hijriToGregorianIso(hijri!.year, hijri!.month, hijri!.day)).toBe(iso);
    expect(formatIso(hijriToGregorian(hijri!.year, hijri!.month, hijri!.day)!)).toBe(iso);
    expect(gregorianToHijri("2026-13-01")).toBeNull();
    expect(hijriToGregorian(1447, 13, 1)).toBeNull();
  });
});
