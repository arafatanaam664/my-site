import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const pageUrl = new URL("../src/pages/index.astro", import.meta.url);
const forbiddenPublicTerms = [
  "المشروع السابق",
  "الموقع السابق",
  "الموقع القديم",
  "Bing",
  "GitHub",
  "Feature Flag",
  "Architecture",
  "SEO strategy",
];

describe("النسخ العامة للصفحة الرئيسية", () => {
  it("تخاطب المستخدم ولا تسرب لغة التخطيط", async () => {
    const source = await readFile(pageUrl, "utf8");
    expect(source).toContain("<h1>اعثر على ما تحتاجه");
    forbiddenPublicTerms.forEach((term) => expect(source).not.toContain(term));
  });
});
