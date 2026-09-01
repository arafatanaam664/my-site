import { describe, expect, it } from "vitest";
import { renderSitemap } from "../src/lib/sitemap";

describe("sitemap المحتوى المنشور", () => {
  it("تسجل الرئيسية والقسم والروابط المنشورة فقط مع ترميز XML آمن", () => {
    const xml = renderSitemap([{ id: "1", kind: "article", slug: "a&b", title: "عنوان", excerpt: null, seo_description: null, primary_media_id: "11111111-1111-1111-1111-111111111111", hub_id: null, section_id: null, published_at: "2026-08-25T00:00:00Z", updated_at: "2026-08-26T00:00:00Z", media: [] }]);
    expect(xml).toContain("https://alshafra.com/articles");
    expect(xml).toContain("https://alshafra.com/tools/hijri-converter");
    expect(xml).toContain("https://alshafra.com/calendar");
    expect(xml).toContain("https://alshafra.com/legal/privacy");
    expect(xml).toContain("a&amp;b");
    expect(xml).toContain("2026-08-26T00:00:00.000Z");
    expect(xml).toContain("xmlns:image=");
    expect(xml).toContain("/media/11111111-1111-1111-1111-111111111111?preset=hero");
  });
});
