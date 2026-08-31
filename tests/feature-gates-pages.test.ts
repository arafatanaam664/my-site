import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../", import.meta.url);

describe("حراسة مفاتيح الميزات العامة", () => {
  it("تطبق حراسة المحتوى والأدوات على الواجهة والمسارات", async () => {
    const [layout, nav, sections, home, section, detail, dateTool, ageTool, hijriTool] = await Promise.all([
      readFile(new URL("src/layouts/BaseLayout.astro", root), "utf8"),
      readFile(new URL("src/components/SiteNav.astro", root), "utf8"),
      readFile(new URL("src/lib/site-sections.ts", root), "utf8"),
      readFile(new URL("src/pages/index.astro", root), "utf8"),
      readFile(new URL("src/pages/[section].astro", root), "utf8"),
      readFile(new URL("src/pages/[section]/[slug].astro", root), "utf8"),
      readFile(new URL("src/pages/tools/date-difference.astro", root), "utf8"),
      readFile(new URL("src/pages/tools/age-calculator.astro", root), "utf8"),
      readFile(new URL("src/pages/tools/hijri-converter.astro", root), "utf8"),
    ]);
    expect(layout).toContain("publicNavigationTree");
    expect(layout).toContain("nav-toggle");
    expect(nav).toContain("nav-hub-toggle");
    expect(sections).toContain('slug: "tools"');
    expect(home).toContain("features.tools_core");
    expect(home).toContain("features.content_core");
    expect(section).toContain("featureForPublicSection");
    expect(detail).toContain("featureForPublicSection");
    expect(dateTool).toContain("features.tools_core");
    expect(ageTool).toContain("features.tools_core");
    expect(hijriTool).toContain("features.tools_core");
  });
});
