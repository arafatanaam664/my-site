export const analyticEventTypes = ["page_view", "read_25", "read_50", "read_75", "read_complete", "tool_use", "content_share"] as const;
export type AnalyticEventType = (typeof analyticEventTypes)[number];
export type AnalyticsEvent = { path: string; eventType: AnalyticEventType; contentId: string | null; durationSeconds: number | null; anonymousDayHash: string; sessionHash: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseAnalyticsInput(input: unknown) {
  const value = input as { path?: unknown; eventType?: unknown; contentId?: unknown; durationSeconds?: unknown; sessionId?: unknown };
  if (typeof value.path !== "string" || !value.path.startsWith("/") || value.path.length > 500 || typeof value.eventType !== "string" || !analyticEventTypes.includes(value.eventType as AnalyticEventType) || typeof value.sessionId !== "string" || value.sessionId.length < 16 || value.sessionId.length > 128) return null;
  const contentId = typeof value.contentId === "string" && uuid.test(value.contentId) ? value.contentId : null;
  if (value.contentId != null && contentId === null) return null;
  const durationSeconds = typeof value.durationSeconds === "number" && Number.isInteger(value.durationSeconds) && value.durationSeconds >= 0 && value.durationSeconds <= 7200 ? value.durationSeconds : null;
  if (value.durationSeconds != null && durationSeconds === null) return null;
  return { path: value.path, eventType: value.eventType as AnalyticEventType, contentId, durationSeconds, sessionId: value.sessionId };
}

export function isSameSiteAnalyticsRequest(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export function needsPriorPageView(eventType: AnalyticEventType) {
  return eventType === "read_25" || eventType === "read_50" || eventType === "read_75" || eventType === "read_complete" || eventType === "tool_use" || eventType === "content_share";
}

export function readingPredecessor(eventType: AnalyticEventType) {
  if (eventType === "read_50") return "read_25";
  if (eventType === "read_75") return "read_50";
  if (eventType === "read_complete") return "read_75";
  return null;
}

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function anonymizeAnalyticsEvent(input: ReturnType<typeof parseAnalyticsInput>, now = new Date()) {
  if (!input) return null;
  const { runtimeSecrets } = await import("./runtime");
  const secret = runtimeSecrets().SUPABASE_SECRET_KEY;
  const day = now.toISOString().slice(0, 10);
  return { path: input.path, eventType: input.eventType, contentId: input.contentId, durationSeconds: input.durationSeconds, anonymousDayHash: await hash(`${secret}:day:${day}:${input.sessionId}`), sessionHash: await hash(`${secret}:session:${input.sessionId}`) } satisfies AnalyticsEvent;
}
