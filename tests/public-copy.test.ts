import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultPublicDescription, forbiddenPublicCmsTerms, publicExcerpt, relatedHeading } from "../src/lib/public-copy";
import { defaultSiteSections } from "../src/lib/site-sections";

const srcRoot = new URL("../src", import.meta.url);
const skip = [/\/admin\//, /AdminLayout\.astro$/, /admin-/];

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(astro|ts|js|mjs)$/.test(entry.name)) files.push(path);
  }
  return files;
}

describe("النسخ العامة للصفحة الرئيسية", () => {
  it("تخاطب المستخدم بعبارات البحث ولا تسرب لغة التخطيط", async () => {
    const source = await readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8");
    expect(source).toContain("<h1>تحويل التاريخ الهجري وأدوات الحساب اليومية</h1>");
    expect(source).toContain("publicNavigationTree");
    expect(source).toContain("publishedContentForSection");
    expect(source).toContain("HomeSections");
    expect(source).toContain("features.content_core");
    expect(source).not.toContain("قريبًا ضمن القسم");
    expect(source).not.toContain("ستتوفر مع الإطلاق");
    forbiddenPublicCmsTerms.forEach((term) => expect(source).not.toContain(term));
  });

  it("تخفي المقتطف العام الفارغ وتعيد وصفًا بحثيًا", () => {
    expect(publicExcerpt("  ")).toBeNull();
    expect(publicExcerpt(null, "حوّل التاريخ الهجري")).toBe("حوّل التاريخ الهجري");
    expect(defaultPublicDescription("tool")).toContain("التاريخ الهجري");
    expect(relatedHeading("guide")).toContain("تحويل التاريخ");
  });

  it("لا تظهر عبارات نظام المحتوى في الصفحات العامة", async () => {
    const files = (await walk(srcRoot.pathname)).filter((path) => !skip.some((pattern) => pattern.test(path.replaceAll("\\", "/"))));
    const hits: string[] = [];
    for (const file of files) {
      if (file.endsWith("public-copy.ts")) continue;
      const source = await readFile(file, "utf8");
      for (const term of forbiddenPublicCmsTerms) {
        if (source.includes(term)) hits.push(`${relative(srcRoot.pathname, file)}: ${term}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("تجعل أوصاف الأقسام الافتراضية عبارات بحث لا تسميات نظام", () => {
    const text = defaultSiteSections().map((section) => `${section.title} ${section.description}`).join("\n");
    forbiddenPublicCmsTerms.forEach((term) => expect(text).not.toContain(term));
    expect(text).toContain("تحويل التاريخ الهجري");
    expect(text).toContain("أم القرى");
  });
});
