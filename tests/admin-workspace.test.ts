import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("مساحة لوحة التحكم المنفصلة عن الموقع", () => {
  it("لا تستخدم ترويسة الموقع العام وتوضّح أدوات التحرير وإدراج الصورة", async () => {
    const [page, layout] = await Promise.all([
      readFile(new URL("../src/pages/admin/index.astro", import.meta.url), "utf8"),
      readFile(new URL("../src/layouts/AdminLayout.astro", import.meta.url), "utf8"),
    ]);
    expect(page).toContain("AdminLayout");
    expect(page).not.toContain("BaseLayout");
    expect(page).not.toContain("عنوان 2");
    expect(page).toContain("عنوان رئيسي داخل الخبر");
    expect(page).toContain("H2 عنوان رئيسي");
    expect(page).toContain("كيف تضع صورة داخل الخبر");
    expect(page).toContain("إدراج الصورة في النص");
    expect(page).toContain('id="open-inline-image"');
    expect(page).toContain('id="editor-block-style"');
    expect(layout).toContain("admin-app");
    expect(layout).toContain("noindex");
    expect(layout).not.toContain("site-header");
    expect(layout).not.toContain("site-footer");
  });
});
