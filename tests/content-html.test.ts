import { describe, expect, it } from "vitest";
import { htmlToPlainText, looksLikeHtml, markdownToEditorHtml, sanitizeContentHtml } from "../src/lib/content-html";
import { contentKindJsonLd } from "../src/lib/content-schema";

describe("تنقية HTML التحريري", () => {
  it("يحذف النصوص البرمجية والروابط غير الآمنة ويبقي التنسيق المسموح", () => {
    const html = sanitizeContentHtml(`<p style="color:#056b66">نص</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><a href="https://example.com">مصدر</a><img src="/media/11111111-1111-1111-1111-111111111111?preset=standard" alt="وصف" />`);
    expect(html).toContain("<p");
    expect(html).toContain("https://example.com");
    expect(html).not.toContain("script");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("/media/11111111-1111-1111-1111-111111111111");
  });

  it("يحول markdown القديم إلى HTML قابل للتحرير", () => {
    expect(looksLikeHtml("<h2>عنوان</h2>")).toBe(true);
    expect(markdownToEditorHtml("## عنوان\n\nفقرة")).toContain("<h2>");
    expect(htmlToPlainText("<h2>عنوان</h2><p>فقرة طويلة</p>")).toBe("عنوان فقرة طويلة");
  });
});

describe("مخطط المحتوى", () => {
  it("يبني HowTo بخطوات من العناوين", () => {
    const schema = contentKindJsonLd({
      kind: "guide",
      title: "دليل التحويل",
      description: "شرح عملي",
      url: "https://alshafra.com/calendar/guides/convert",
      datePublished: "2026-08-30T00:00:00Z",
      dateModified: "2026-08-30T00:00:00Z",
      body: "<h2>الخطوة الأولى</h2><p>ابدأ</p><h2>الخطوة الثانية</h2><p>أتمم</p>",
    }) as { "@type": string; step: Array<{ name: string }> };
    expect(schema["@type"]).toBe("HowTo");
    expect(schema.step.map((step) => step.name)).toEqual(["الخطوة الأولى", "الخطوة الثانية"]);
  });
});
