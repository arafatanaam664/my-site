import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("صفحات المجتمع العامة", () => {
  it("تبقى محروسة بمفتاح المجتمع ولا تفتح إدخالًا مجهولًا", async () => {
    const [indexPage, detail] = await Promise.all([
      readFile(new URL("../src/pages/community/index.astro", import.meta.url), "utf8"),
      readFile(new URL("../src/pages/community/[slug].astro", import.meta.url), "utf8"),
    ]);
    expect(indexPage).toContain("features.community");
    expect(indexPage).toContain("لا نفتح التعليق أو إنشاء سؤال للزائر المجهول");
    expect(detail).toContain("publishedQuestion");
    expect(detail).toContain("publishedAnswers");
  });
});
