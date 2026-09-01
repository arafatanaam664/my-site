import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("عرض الأقسام على الرئيسية", () => {
  it("يبني الرئيسية من شجرة الأقسام المنشورة ويربط الأخبار بالصورة", async () => {
    const [home, grid, schema, layout] = await Promise.all([
      readFile(new URL("../src/pages/index.astro", import.meta.url), "utf8"),
      readFile(new URL("../src/components/ContentPreviewGrid.astro", import.meta.url), "utf8"),
      readFile(new URL("../src/lib/content-schema.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
    ]);
    expect(home).toContain("publicNavigationTree");
    expect(home).toContain("publishedContentForSection");
    expect(home).toContain("HomeSections");
    expect(grid).toContain("content-card-hero");
    expect(grid).toContain('featured ? "hero" : "standard"');
    expect(schema).toContain("ImageObject");
    expect(schema).toContain("NewsArticle");
    expect(layout).toContain("max-image-preview:large");
    expect(layout).toContain("article:published_time");
  });
});
