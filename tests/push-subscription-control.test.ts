import { describe, expect, it } from "vitest";

describe("واجهة اشتراك إشعارات المتصفح", () => {
  it("تعرض زر تفعيل صريح ولا تستدعي الإذن أثناء تحميل الصفحة", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("src/components/PushSubscriptionControl.astro", "utf8"));
    expect(source).toContain("Notification.requestPermission()");
    expect(source.indexOf("Notification.requestPermission()")).toBeGreaterThan(source.indexOf("button.addEventListener(\"click\""));
    expect(source).toContain("إلغاء إشعارات المتصفح");
  });
});
