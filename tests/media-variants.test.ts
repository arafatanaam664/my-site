import { describe, expect, it } from "vitest";
import { plannedVariantsFor } from "../src/lib/server/media-variants";

describe("manifest النسخ المشتقة للوسائط", () => {
  it("ينشئ النسخ المتوقعة بحالة تحويل عند الطلب دون ادعاء وجود ملف مخزن", () => {
    expect(plannedVariantsFor("media-id")).toEqual([
      { media_id: "media-id", variant_key: "hero_1200", status: "on_demand" },
      { media_id: "media-id", variant_key: "standard_768", status: "on_demand" },
      { media_id: "media-id", variant_key: "compact_480", status: "on_demand" },
      { media_id: "media-id", variant_key: "og_1200x630", status: "on_demand" },
    ]);
  });
});
