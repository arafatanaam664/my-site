import { describe, expect, it } from "vitest";
import { parseSiteNotice } from "../src/lib/platform-settings";

describe("إعداد تنبيه المنصة", () => {
  it("يقبل تنبيهًا عامًا محدود النص ويرفض البنية غير الآمنة", () => {
    expect(parseSiteNotice({ enabled: true, message: "تنبيه مختصر" })).toEqual({ enabled: true, message: "تنبيه مختصر" });
    expect(parseSiteNotice({ enabled: true, message: "x".repeat(241) })).toBeNull();
    expect(parseSiteNotice({ enabled: "yes", message: "تنبيه" })).toBeNull();
  });
});
