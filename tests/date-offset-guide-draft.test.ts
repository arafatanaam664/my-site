import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("مسودة دليل حساب التاريخ", () => {
  it("تتضمن بيانات نشر ومصدرًا موثوقًا وتنبه بوضوح إلى حدود الحساب التقويمي", async () => {
    const draft = await readFile(new URL("../docs/content-drafts/date-offset-leap-year-guide.md", import.meta.url), "utf8");
    expect(draft).toContain("slug: calculate-date-after-days-leap-year-guide");
    expect(draft).toContain("source_url: https://aa.usno.navy.mil/faq/leap_years");
    expect(draft).toContain("source_kind: official");
    expect(draft).toContain("أيامًا تقويمية");
    expect(draft).toContain("ليست وسيلة لحساب أيام الدوام أو العطل أو المهل النظامية");
    expect(draft).toContain("سنة 2000 كبيسة، بينما سنة 2100 ليست كذلك");
  });
});
