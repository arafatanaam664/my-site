import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("مسودة مقال فرق الأيام", () => {
  it("تتضمن نصًا أصليًا ومصدرين مؤسسيين وحدود الاستخدام", async () => {
    const draft = await readFile(new URL("../docs/content-drafts/calculate-days-between-dates-article.md", import.meta.url), "utf8");
    expect(draft).toContain("kind: article");
    expect(draft).toContain("slug: calculate-days-between-two-dates");
    expect(draft).toContain("https://aa.usno.navy.mil/faq/calendars");
    expect(draft).toContain("https://www.nist.gov/pml/time-and-frequency-division");
    expect(draft).toContain("فرقًا تقويميًا");
    expect(draft).toContain("ليست بديلًا عن نص نظامي");
    expect(draft.length).toBeGreaterThan(1600);
  });
});
