import type { APIRoute } from "astro";
import { adminClient } from "../../../lib/server/admin";
import { anonymizeAnalyticsEvent, isSameSiteAnalyticsRequest, needsPriorPageView, parseAnalyticsInput, readingPredecessor } from "../../../lib/server/analytics";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isSameSiteAnalyticsRequest(request)) return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    const input = parseAnalyticsInput(JSON.parse(await request.text()));
    const event = await anonymizeAnalyticsEvent(input);
    if (!event) return new Response(null, { status: 204 });
    const client = adminClient(); const dayStart = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";
    const { data: duplicate } = await client.from("page_events").select("id").eq("session_hash", event.sessionHash).eq("path", event.path).eq("event_type", event.eventType).gte("occurred_at", dayStart).limit(1);
    if (duplicate?.length) return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    if (needsPriorPageView(event.eventType)) {
      const recentStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const prerequisite = readingPredecessor(event.eventType) ?? "page_view";
      const { data: priorEvents } = await client.from("page_events").select("id").eq("session_hash", event.sessionHash).eq("path", event.path).eq("event_type", prerequisite).gte("occurred_at", recentStart).limit(1);
      if (!priorEvents?.length) return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
    }
    const { error } = await client.from("page_events").insert({ content_id: event.contentId, path: event.path, event_type: event.eventType, anonymous_day_hash: event.anonymousDayHash, session_hash: event.sessionHash, duration_seconds: event.durationSeconds });
    return new Response(null, { status: error ? 204 : 202, headers: { "cache-control": "no-store" } });
  } catch {
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
};
