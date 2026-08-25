import { describe, expect, it } from "vitest";
import { aggregateAnalytics, analyticsSince } from "../src/lib/server/analytics-report";

describe("تقرير التحليلات", () => {
  it("يجمع الزيارات والقراءة المكتملة والعمق من الأحداث الفعلية فقط", () => {
    const report = aggregateAnalytics([{ path: "/articles/a", content_id: "a", event_type: "page_view", anonymous_day_hash: "d1", session_hash: "s1", duration_seconds: null, occurred_at: "2026-08-25T00:00:00Z", content_items: { title: "أ", slug: "a", kind: "article" } }, { path: "/articles/a", content_id: "a", event_type: "read_50", anonymous_day_hash: "d1", session_hash: "s1", duration_seconds: null, occurred_at: "2026-08-25T00:01:00Z" }, { path: "/articles/a", content_id: "a", event_type: "read_complete", anonymous_day_hash: "d1", session_hash: "s1", duration_seconds: 90, occurred_at: "2026-08-25T00:02:00Z" }, { path: "/tools/date-difference", content_id: null, event_type: "tool_use", anonymous_day_hash: "d1", session_hash: "s1", duration_seconds: null, occurred_at: "2026-08-25T00:03:00Z" }]);
    expect(report.total).toMatchObject({ pageViews: 1, visits: 1, completedReads: 1, toolUses: 1, averageReadSeconds: 90 });
    expect(report.pages[0]).toMatchObject({ title: "أ", completionRate: 100, averageReadSeconds: 90 });
  });
  it("ينتج بداية فترة صالحة لكل فلتر", () => expect(analyticsSince("year", new Date("2026-08-25T00:00:00Z"))).toBe("2025-08-25T00:00:00.000Z"));
});
