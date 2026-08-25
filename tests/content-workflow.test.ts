import { describe, expect, it } from "vitest";
import { canAccessEditorialContent, canTransitionContent, isContentStatus, publicationReadiness } from "../src/lib/server/content-workflow";

describe("سير مراجعة المحتوى", () => {
  it("يسمح بتسلسل المراجعة الصحيح فقط", () => {
    expect(canTransitionContent("author", "draft", "in_review")).toBe(true);
    expect(canTransitionContent("editor", "in_review", "approved")).toBe(true);
    expect(canTransitionContent("admin", "approved", "published")).toBe(true);
    expect(canTransitionContent("editor", "published", "archived")).toBe(true);
  });

  it("يرفض القفز إلى النشر أو اعتماد المؤلف لمادته", () => {
    expect(canTransitionContent("author", "in_review", "approved")).toBe(false);
    expect(canTransitionContent("editor", "draft", "published")).toBe(false);
    expect(canTransitionContent("admin", "archived", "published")).toBe(false);
    expect(isContentStatus("approved")).toBe(true);
    expect(isContentStatus("deleted")).toBe(false);
  });

  it("يسمح للمحرر بمراجعة مادة مؤلف آخر ويقصر المؤلف على مواده", () => {
    expect(canAccessEditorialContent("editor", "editor-1", "author-1")).toBe(true);
    expect(canAccessEditorialContent("admin", "admin-1", "author-1")).toBe(true);
    expect(canAccessEditorialContent("author", "author-1", "author-1")).toBe(true);
    expect(canAccessEditorialContent("author", "author-2", "author-1")).toBe(false);
  });

  it("يطالب المقال والدليل بنص وصورة كبيرة ووصف ومصدر قبل النشر", () => {
    const issues = publicationReadiness({ kind: "article", title: "عنوان صالح للمادة المنشورة", body: "ن".repeat(320), seoDescription: "و".repeat(75), primaryMedia: { width: 1200, height: 500 }, sourceCount: 0 });
    expect(issues).toContain("أضف مصدرًا موثقًا واحدًا على الأقل");
    expect(publicationReadiness({ kind: "guide", title: "عنوان صالح للمادة المنشورة", body: "ن".repeat(320), seoDescription: "و".repeat(75), primaryMedia: { width: 1199, height: 500 }, sourceCount: 1 })).toContain("الصورة الرئيسية تحتاج إلى عرض 1200px ومساحة 300 ألف بكسل على الأقل");
    expect(publicationReadiness({ kind: "tool", title: "عنوان صالح للمادة المنشورة", body: "ن".repeat(320), seoDescription: "و".repeat(75), primaryMedia: { width: 1200, height: 500 }, sourceCount: 0 })).toEqual([]);
  });
});
