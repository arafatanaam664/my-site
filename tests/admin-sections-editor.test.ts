import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("لوحة الأقسام والمحرر", () => {
  it("تتيح إدارة الأقسام المتداخلة وربط المسودة بقسم رئيسي وفرعي", async () => {
    const page = await readFile(new URL("../src/pages/admin/index.astro", import.meta.url), "utf8");
    expect(page).toContain('data-admin-nav="sections"');
    expect(page).toContain("id=\"site-section-form\"");
    expect(page).toContain("id=\"draft-hub\"");
    expect(page).toContain("id=\"draft-section\"");
    expect(page).toContain("/api/admin/platform/sections");
  });

  it("يوفر محررًا غنيًا بعناوين وتنسيق ولون وجدول بدل حقل نص فارغ", async () => {
    const page = await readFile(new URL("../src/pages/admin/index.astro", import.meta.url), "utf8");
    expect(page).toContain("id=\"rich-editor-surface\"");
    expect(page).toContain('data-editor-value="h2"');
    expect(page).toContain("عنوان رئيسي داخل الخبر");
    expect(page).not.toContain("عنوان 2");
    expect(page).toContain("foreColor");
    expect(page).toContain("insertTable");
    expect(page).toContain("mountRichEditor");
  });
});
