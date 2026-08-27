import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { platformFeatureDefinitions } from "../src/lib/platform-foundation";

describe("مشاركة المحتوى الاختيارية", () => {
  it("تبقى موقوفة افتراضيًا لكنها معدة للعرض العام عند تفعيلها", async () => {
    expect(platformFeatureDefinitions.find((definition) => definition.flag === "social_sharing")).toMatchObject({ defaultEnabled: false, publicVisible: true });
    const component = await readFile(new URL("../src/components/ShareActions.astro", import.meta.url), "utf8");
    expect(component).toContain("navigator.share");
    expect(component).toContain("navigator.clipboard.writeText");
    expect(component).toContain("alshafra:content-share");
  });
});
