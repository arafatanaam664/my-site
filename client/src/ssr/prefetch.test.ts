import { describe, expect, it } from "vitest";
import { editorialItems, findEditorialItem, findTool, tools } from "@/content/catalog";
import { prefetchForPath } from "./prefetch";

describe("كتالوج Alshafra", () => {
  it("يحتفظ بأدوات ذات slugs فريدة وبدليل مرتبط منشور", () => {
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(tools.length);
    for (const tool of tools) expect(findEditorialItem(tool.relatedGuideSlug)).toBeDefined();
  });

  it("يقتصر على مصادر https عندما تعرض الصفحة مصدرًا خارجيًا", () => {
    for (const item of editorialItems) if (item.sourceUrl) expect(item.sourceUrl.startsWith("https://")).toBe(true);
  });
});

describe("metadata الصفحات العامة", () => {
  it("يغطي جميع الأدوات والأدلة والمقالات المنشورة بمسار صالح قابل للفهرسة", () => {
    const staticPaths = ["/", "/tools", "/calendar", "/guides", "/articles", "/about", "/privacy", "/terms", "/contact"];
    const contentPaths = [
      ...tools.map((tool) => `/tools/${tool.slug}`),
      ...editorialItems.map((item) => `/${item.type === "guide" ? "guides" : "articles"}/${item.slug}`),
    ];
    for (const path of [...staticPaths, ...contentPaths]) {
      const head = prefetchForPath(path);
      expect(head.notFound, path).not.toBe(true);
      expect(head.noindex, path).not.toBe(true);
      expect(head.canonicalPath, path).toBe(path);
    }
  });

  it("ينشئ عنوانًا وcanonical لأداة منشورة", () => {
    const head = prefetchForPath("/tools/age-calculator");
    expect(head.notFound).toBeUndefined();
    expect(head.canonicalPath).toBe("/tools/age-calculator");
    expect(head.title).toContain(findTool("age-calculator")!.title);
  });

  it("يعطي المقال schema مناسبًا ويرفض slug غير موجود بحالة 404", () => {
    expect(prefetchForPath("/articles/percentage-basics").schema).toBe("article");
    expect(prefetchForPath("/articles/not-published").notFound).toBe(true);
  });

  it("يبقي البحث الداخلي خارج الفهرسة", () => {
    expect(prefetchForPath("/search?q=التاريخ").noindex).toBe(true);
  });
});
