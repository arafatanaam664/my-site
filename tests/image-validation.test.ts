import { describe, expect, it } from "vitest";
import { inspectSupportedImage, sanitizeAltText, sha256Hex } from "../src/lib/server/image-validation";

function png(width: number, height: number) {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  bytes[16] = (width >>> 24) & 0xff;
  bytes[17] = (width >>> 16) & 0xff;
  bytes[18] = (width >>> 8) & 0xff;
  bytes[19] = width & 0xff;
  bytes[20] = (height >>> 24) & 0xff;
  bytes[21] = (height >>> 16) & 0xff;
  bytes[22] = (height >>> 8) & 0xff;
  bytes[23] = height & 0xff;
  return bytes;
}

describe("التحقق من بيانات الصور الخام", () => {
  it("يستخرج النوع والأبعاد من توقيع PNG نفسه", () => {
    expect(inspectSupportedImage(png(1200, 630))).toEqual({ mimeType: "image/png", extension: "png", width: 1200, height: 630 });
  });

  it("يرفض بايتات ليست صورة مدعومة أو ذات أبعاد غير مقبولة", () => {
    expect(inspectSupportedImage(new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(inspectSupportedImage(png(0, 630))).toBeNull();
  });

  it("يطبع checksum ثابتًا وينظف النص البديل قبل الحفظ", async () => {
    await expect(sha256Hex(new TextEncoder().encode("alshafra"))).resolves.toMatch(/^[a-f0-9]{64}$/);
    expect(sanitizeAltText("  وصف\u0000   صورة  ")).toBe("وصف صورة");
  });
});
