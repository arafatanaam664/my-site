export type AnalyticsRange = "day" | "week" | "month" | "year";
type RawEvent = { path: string; content_id: string | null; event_type: string; anonymous_day_hash: string; session_hash: string | null; duration_seconds: number | null; occurred_at: string; content_items?: { title?: string; slug?: string; kind?: string } | null };

export function isAnalyticsRange(value: string | null): value is AnalyticsRange { return value === "day" || value === "week" || value === "month" || value === "year"; }

export function analyticsSince(range: AnalyticsRange, now = new Date()) {
  const result = new Date(now);
  if (range === "day") result.setUTCDate(result.getUTCDate() - 1);
  if (range === "week") result.setUTCDate(result.getUTCDate() - 7);
  if (range === "month") result.setUTCMonth(result.getUTCMonth() - 1);
  if (range === "year") result.setUTCFullYear(result.getUTCFullYear() - 1);
  return result.toISOString();
}

export function aggregateAnalytics(events: RawEvent[]) {
  const total = { pageViews: events.filter((event) => event.event_type === "page_view").length, visits: new Set(events.filter((event) => event.event_type === "page_view").map((event) => event.anonymous_day_hash)).size, completedReads: events.filter((event) => event.event_type === "read_complete").length, toolUses: events.filter((event) => event.event_type === "tool_use").length, contentShares: events.filter((event) => event.event_type === "content_share").length };
  const durations = events.filter((event) => event.event_type === "read_complete" && event.duration_seconds != null).map((event) => event.duration_seconds as number);
  const averageReadSeconds = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0;
  const byPage = new Map<string, RawEvent[]>();
  for (const event of events) { const key = event.content_id ?? event.path; byPage.set(key, [...(byPage.get(key) ?? []), event]); }
  const pages = [...byPage.values()].map((rows) => {
    const pageViews = rows.filter((event) => event.event_type === "page_view").length;
    const read50 = rows.filter((event) => event.event_type === "read_50").length;
    const complete = rows.filter((event) => event.event_type === "read_complete");
    const pageDurations = complete.map((event) => event.duration_seconds).filter((value): value is number => value != null);
    const first = rows[0];
    return { key: first.content_id ?? first.path, path: first.path, title: first.content_items?.title ?? null, slug: first.content_items?.slug ?? null, kind: first.content_items?.kind ?? null, pageViews, visits: new Set(rows.filter((event) => event.event_type === "page_view").map((event) => event.anonymous_day_hash)).size, read50, completionRate: pageViews ? Math.round((complete.length / pageViews) * 100) : 0, averageReadSeconds: pageDurations.length ? Math.round(pageDurations.reduce((sum, value) => sum + value, 0) / pageDurations.length) : 0 };
  }).sort((a, b) => b.pageViews - a.pageViews || b.visits - a.visits);
  return { total: { ...total, averageReadSeconds }, pages };
}
