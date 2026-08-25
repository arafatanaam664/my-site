import { describe, expect, it } from "vitest";
import { parseSources } from "../src/lib/server/content-sources";

describe("التحقق من مصادر المحتوى", () => {
  it("يقبل مصدر HTTPS موثقًا ويطبع حقوله", () => {
    expect(parseSources([{ title: "الهيئة العامة للإحصاء", url: "https://www.stats.gov.sa/ar", kind: "official", publisher: "الهيئة العامة للإحصاء", publishedAt: "2026-08-25", note: "مصدر أساسي" }])).toEqual([{ title: "الهيئة العامة للإحصاء", url: "https://www.stats.gov.sa/ar", kind: "official", publisher: "الهيئة العامة للإحصاء", publishedAt: "2026-08-25", note: "مصدر أساسي" }]);
  });

  it("يرفض رابط HTTP أو نوعًا غير معروف أو تكرار المصدر", () => {
    expect(parseSources([{ title: "مصدر صالح", url: "http://example.com", kind: "official" }])).toBeNull();
    expect(parseSources([{ title: "مصدر صالح", url: "https://example.com", kind: "unknown" }])).toBeNull();
    expect(parseSources([{ title: "مصدر واحد", url: "https://example.com", kind: "official" }, { title: "مصدر مكرر", url: "https://example.com", kind: "primary" }])).toBeNull();
  });
});
