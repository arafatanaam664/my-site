import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("خط أساس ضمان الجودة", () => {
  it("يفصل بين حالة المعاينة ومتطلبات الإنتاج ولا يقدم ضمانات نتائج خارجية", async () => {
    const baseline = await readFile(new URL("../docs/rebuild/public-qa-baseline-2026-08.md", import.meta.url), "utf8");
    expect(baseline).toContain("ليست جاهزة بعد لتحويل نطاق `alshafra.com`");
    expect(baseline).toContain("تبقى الوحدات غير الجاهزة غير مكشوفة للعامة");
    expect(baseline).toContain("لا تضمن ترتيبًا أو ظهورًا");
    expect(baseline).toContain("لا يوجد في النسخة أي نشر اجتماعي تلقائي");
  });
});
