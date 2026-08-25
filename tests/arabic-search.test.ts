import { describe, expect, it } from "vitest";
import { normalizeArabicSearch, searchPublicContent } from "../src/lib/arabic-search";

describe("البحث العربي", () => {
  it("يطبع الهمزات والتشكيل والياء والتاء المربوطة", () => {
    expect(normalizeArabicSearch("إِجَازَة ـ هُدَى مدرِسَة")).toBe("اجازه هدي مدرسه");
  });

  it("يرتب النتائج المنشورة مع تفضيل تطابق العنوان", () => {
    const results = searchPublicContent([
      { id: "1", kind: "article", slug: "date", title: "تحويل التاريخ الهجري", excerpt: null, seo_description: null, primary_media_id: null, published_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z", media: [] },
      { id: "2", kind: "guide", slug: "holiday", title: "دليل الإجازات", excerpt: "شرح تحويل التاريخ", seo_description: null, primary_media_id: null, published_at: "2026-02-01T00:00:00Z", updated_at: "2026-02-01T00:00:00Z", media: [] },
    ], "تحويل التاريخ");
    expect(results.map((item) => item.id)).toEqual(["1", "2"]);
  });
});
