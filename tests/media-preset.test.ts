import { describe, expect, it } from "vitest";
import { parseMediaPreset, transformForPreset } from "../src/lib/server/media-preset";

describe("تحويلات عرض صور المحتوى", () => {
  it("يسمح بالمقاسات التحريرية المحددة فقط", () => {
    expect(parseMediaPreset("hero")).toBe("hero");
    expect(parseMediaPreset("1537")).toBeNull();
    expect(parseMediaPreset("../../source")).toBeNull();
  });

  it("يحافظ على الصورة كاملة ويختار صيغة العميل الحديثة", () => {
    expect(transformForPreset("standard", "image/avif,image/webp")).toEqual({ fit: "scale-down", width: 768, format: "avif", quality: 82 });
    expect(transformForPreset("compact", "image/webp")).toEqual({ fit: "scale-down", width: 480, format: "webp", quality: 72 });
  });
});
