import { describe, expect, it } from "vitest";
import { buildSectionTree, contentPath, defaultSiteSections, findSectionBySlugPath } from "../src/lib/site-sections";
import { schemaTypeForKind } from "../src/lib/content-schema";

describe("أقسام المنصة المتداخلة", () => {
  it("يبني التقويم والمواعيد كقسم رئيسي مع أقسام فرعية للمحتوى", () => {
    const tree = buildSectionTree(defaultSiteSections());
    const calendar = tree.find((hub) => hub.slug === "calendar");
    expect(calendar?.title).toBe("التقويم والمواعيد");
    expect(calendar?.href).toBe("/calendar");
    expect(calendar?.children.map((child) => child.slug)).toEqual(["news", "guides", "tools", "solutions", "articles"]);
    expect(calendar?.children.find((child) => child.slug === "news")?.href).toBe("/calendar/news");
    expect(findSectionBySlugPath(defaultSiteSections(), "calendar", "guides").child?.contentKind).toBe("guide");
  });

  it("يبقي المجتمع قسمًا رئيسيًا مغلقًا افتراضيًا", () => {
    const community = buildSectionTree(defaultSiteSections()).find((hub) => hub.slug === "community");
    expect(community?.enabled).toBe(false);
    expect(community?.href).toBe("/community");
  });

  it("يربط المادة بالمسار المتداخل عند تعيين القسم", () => {
    expect(contentPath("news", "today-update", "calendar", "news")).toBe("/calendar/news/today-update");
    expect(contentPath("article", "how-to-count")).toBe("/articles/how-to-count");
  });
});

describe("البيانات المنظمة حسب نوع المحتوى", () => {
  it("يميز الخبر عن الدليل عن الأداة", () => {
    expect(schemaTypeForKind("news")).toBe("NewsArticle");
    expect(schemaTypeForKind("guide")).toBe("HowTo");
    expect(schemaTypeForKind("tool")).toBe("WebApplication");
    expect(schemaTypeForKind("faq")).toBe("FAQPage");
    expect(schemaTypeForKind("article")).toBe("Article");
  });
});
