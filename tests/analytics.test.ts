import { describe, expect, it } from "vitest";
import { isSameSiteAnalyticsRequest, needsPriorPageView, parseAnalyticsInput, readingPredecessor } from "../src/lib/server/analytics";

describe("قياس الخصوصية", () => {
  it("يقبل الحد الأدنى من الحدث ولا يقبل مسارًا خارجيًا أو معرف مادة غير صحيح", () => {
    expect(parseAnalyticsInput({ path: "/articles/test", eventType: "read_50", contentId: null, durationSeconds: 42, sessionId: "1234567890abcdef" })).toMatchObject({ eventType: "read_50", durationSeconds: 42 });
    expect(parseAnalyticsInput({ path: "/guides/example", eventType: "content_share", contentId: null, durationSeconds: null, sessionId: "1234567890abcdef" })).toMatchObject({ eventType: "content_share", contentId: null });
    expect(parseAnalyticsInput({ path: "https://example.com", eventType: "page_view", sessionId: "1234567890abcdef" })).toBeNull();
    expect(parseAnalyticsInput({ path: "/", eventType: "page_view", contentId: "not-a-uuid", sessionId: "1234567890abcdef" })).toBeNull();
  });
  it("يقبل فقط أحداث القياس الصادرة من أصل الموقع نفسه", () => {
    expect(isSameSiteAnalyticsRequest(new Request("https://alshafra.com/api/analytics/event", { headers: { origin: "https://alshafra.com" } }))).toBe(true);
    expect(isSameSiteAnalyticsRequest(new Request("https://alshafra.com/api/analytics/event", { headers: { origin: "https://evil.example" } }))).toBe(false);
  });
  it("يتطلب مشاهدة صفحة قبل أحداث القراءة واستخدام الأداة وتفاعل المشاركة", () => {
    expect(needsPriorPageView("page_view")).toBe(false);
    expect(needsPriorPageView("read_50")).toBe(true);
    expect(needsPriorPageView("tool_use")).toBe(true);
    expect(needsPriorPageView("content_share")).toBe(true);
  });
  it("يعرف الحدث السابق المطلوب لكل عمق قراءة", () => {
    expect(readingPredecessor("read_25")).toBeNull();
    expect(readingPredecessor("read_50")).toBe("read_25");
    expect(readingPredecessor("read_75")).toBe("read_50");
    expect(readingPredecessor("read_complete")).toBe("read_75");
  });
});
