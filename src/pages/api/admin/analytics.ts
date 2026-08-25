import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../lib/server/admin";
import { aggregateAnalytics, analyticsSince, isAnalyticsRange } from "../../../lib/server/analytics-report";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const GET: APIRoute = async ({ request, url }) => {
  try {
    const viewer = await requireEditor(request);
    if (viewer.role === "author") return json({ error: "لا تملك صلاحية عرض التقارير" }, 403);
    const requestedRange = url.searchParams.get("range"); const range = isAnalyticsRange(requestedRange) ? requestedRange : "month";
    const { data, error } = await adminClient().from("page_events").select("path,content_id,event_type,anonymous_day_hash,session_hash,duration_seconds,occurred_at,content_items(title,slug,kind)").gte("occurred_at", analyticsSince(range)).order("occurred_at", { ascending: false }).limit(10_000);
    if (error) return json({ error: "تعذر تحميل أحداث التحليلات" }, 500);
    return json({ data: { range, generatedAt: new Date().toISOString(), ...aggregateAnalytics((data ?? []) as Parameters<typeof aggregateAnalytics>[0]) } });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية عرض التقارير" }, error.status);
    return json({ error: "تعذر تحميل التقارير" }, 500);
  }
};
