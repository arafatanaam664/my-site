import type { APIRoute } from "astro";
import { adminClient } from "../../../../lib/server/admin";
import { parseBrowserSubscription } from "../../../../lib/web-push-input";
import { pushConfiguration } from "../../../../lib/server/web-push";

export const prerender = false;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const isSameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!isSameOrigin(request)) return json({ error: "طلب غير مسموح" }, 403);
    if (!pushConfiguration()) return json({ error: "الإشعارات غير مهيأة بعد" }, 503);
    const subscription = parseBrowserSubscription((await request.json() as { subscription?: unknown }).subscription);
    if (!subscription) return json({ error: "اشتراك المتصفح غير صالح" }, 400);
    const { error } = await adminClient().from("notification_subscriptions").upsert({ channel: "web_push", destination: subscription.endpoint, push_p256dh: subscription.keys.p256dh, push_auth: subscription.keys.auth, consent_version: "web-push-v1", consented_at: new Date().toISOString(), revoked_at: null, topics: ["content"] }, { onConflict: "channel,destination" });
    return error ? json({ error: "تعذر حفظ اشتراك الإشعارات" }, 500) : json({ data: { subscribed: true } }, 201);
  } catch { return json({ error: "تعذر حفظ اشتراك الإشعارات" }, 500); }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    if (!isSameOrigin(request)) return json({ error: "طلب غير مسموح" }, 403);
    const subscription = parseBrowserSubscription((await request.json() as { subscription?: unknown }).subscription);
    if (!subscription) return json({ error: "اشتراك المتصفح غير صالح" }, 400);
    const { error } = await adminClient().from("notification_subscriptions").update({ revoked_at: new Date().toISOString() }).eq("channel", "web_push").eq("destination", subscription.endpoint);
    return error ? json({ error: "تعذر إلغاء الاشتراك" }, 500) : json({ data: { unsubscribed: true } });
  } catch { return json({ error: "تعذر إلغاء الاشتراك" }, 500); }
};
