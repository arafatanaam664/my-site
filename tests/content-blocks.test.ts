import { describe, expect, it } from "vitest";
import { contentBlocks } from "../src/lib/content-blocks";

describe("كتل العرض العام للمحتوى", () => {
  it("يفصل العناوين والفقرات ووسوم الصور دون تمرير HTML حر", () => {
    const id = "11111111-1111-1111-1111-111111111111";
    expect(contentBlocks(`## عنوان رئيسي\n\nفقرة أولى\nتستمر هنا\n\n{{media:${id}}}\n\n### عنوان فرعي\n\nفقرة أخيرة`)).toEqual([
      { type: "heading", level: 2, text: "عنوان رئيسي" },
      { type: "paragraph", text: "فقرة أولى تستمر هنا" },
      { type: "media", mediaId: id },
      { type: "heading", level: 3, text: "عنوان فرعي" },
      { type: "paragraph", text: "فقرة أخيرة" },
    ]);
  });

  it("يعامل الروابط وHTML كنص بدل تحويلها إلى عناصر غير موثوقة", () => {
    expect(contentBlocks("<script>alert(1)</script>\n\n[رابط](https://example.com)")).toEqual([{ type: "paragraph", text: "<script>alert(1)</script>" }, { type: "paragraph", text: "[رابط](https://example.com)" }]);
  });
});
