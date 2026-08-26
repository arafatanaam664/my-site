import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pageUrl = new URL("../src/pages/admin/index.astro", import.meta.url);

describe("غرفة عمليات الإدارة", () => {
  it("تقدم ملخصًا وتنقلًا واضحًا للمحتوى والقياس والإعدادات", async () => {
    const page = await readFile(pageUrl, "utf8");
    expect(page).toContain("غرفة العمليات");
    expect(page).toContain('data-admin-nav="overview"');
    expect(page).toContain('data-admin-nav="content"');
    expect(page).toContain('data-admin-nav="analytics"');
    expect(page).toContain('data-admin-nav="settings"');
    expect(page).toContain("activateAdminView");
  });
});
