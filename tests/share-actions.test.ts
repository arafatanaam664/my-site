import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { platformFeatureDefinitions } from "../src/lib/platform-foundation";

describe("مشاركة المحتوى الاختيارية", () => {
  it("تكون معدة للعرض العام عند الإطلاق وتشمل المنصات الأساسية دون نشر تلقائي", async () => {
    expect(platformFeatureDefinitions.find((definition) => definition.flag === "social_sharing")).toMatchObject({ defaultEnabled: true, publicVisible: true });
    const component = await readFile(new URL("../src/components/ShareActions.astro", import.meta.url), "utf8");
    expect(component).toContain("navigator.share");
    expect(component).toContain("navigator.clipboard.writeText");
    expect(component).toContain("alshafra:content-share");
    expect(component).toContain("facebook.com/sharer");
    expect(component).toContain("twitter.com/intent/tweet");
    expect(component).toContain("لا يتم النشر التلقائي من الموقع");
  });
});
