import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("تدقيق جودة الصفحات العامة", () => {
  it("يفحص HTML والبيانات الوصفية عبر طلبات قراءة فقط دون ادعاء قياس أداء", async () => {
    const script = await readFile(new URL("../scripts/verify-public-page-quality.mjs", import.meta.url), "utf8");
    expect(script).toContain("scope: \"public_page_structure_and_metadata\"");
    expect(script).toContain('path: "/tools/weekday-calculator"');
    expect(script).toContain('path: "/articles/calculate-days-between-two-dates"');
    expect(script).toContain('path: "/guides/calculate-date-after-days-leap-year-guide"');
    expect(script).toContain('name=\"robots\" content=\"noindex,follow\"');
    expect(script).toContain('<main id=\\"main-content\\"');
    expect(script).not.toContain("POST");
    expect(script).not.toContain("performance.now");
  });
});
