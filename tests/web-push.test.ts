import { describe, expect, it } from "vitest";
import { parseBrowserSubscription } from "../src/lib/web-push-input";

describe("اشتراك إشعارات المتصفح", () => {
  const subscription = { endpoint: "https://push.example.test/token", expirationTime: null, keys: { p256dh: "a".repeat(24), auth: "b".repeat(24) } };
  it("يقبل اشتراك HTTPS بالمفاتيح المطلوبة فقط", () => expect(parseBrowserSubscription(subscription)).toEqual(subscription));
  it("يرفض endpoint غير آمن أو مفاتيح ناقصة", () => {
    expect(parseBrowserSubscription({ ...subscription, endpoint: "http://push.example.test/token" })).toBeNull();
    expect(parseBrowserSubscription({ ...subscription, keys: { p256dh: "x", auth: "b".repeat(24) } })).toBeNull();
  });
});
