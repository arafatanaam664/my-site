import { describe, expect, it } from "vitest";
import { discoverImageReady, targetDimensions } from "../src/lib/server/image-optimize";

describe("ضغط أبعاد الصور للويب واقتراحات جوجل", () => {
  it("لا يكبّر الصورة الصغيرة ويخفض الحافة الأطول إلى 1920", () => {
    expect(targetDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(targetDimensions(3840, 2160)).toEqual({ width: 1920, height: 1080 });
  });

  it("يعدّ الصورة جاهزة لعروض جوجل الكبيرة عند عرض 1200 على الأقل", () => {
    expect(discoverImageReady(1200, 675)).toBe(true);
    expect(discoverImageReady(800, 450)).toBe(false);
  });
});
