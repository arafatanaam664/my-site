import { buildPushPayload, type PushSubscription } from "@block65/webcrypto-web-push";
import { adminClient } from "./admin";
import { runtimeSecrets } from "./runtime";
export { parseBrowserSubscription, type BrowserPushSubscription } from "../web-push-input";

export function pushConfiguration() {
  try {
    const secrets = runtimeSecrets();
    const env = secrets as typeof secrets & { VAPID_PUBLIC_KEY?: string; VAPID_PRIVATE_KEY?: string; VAPID_SUBJECT?: string };
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) return null;
    return { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY, subject: env.VAPID_SUBJECT };
  } catch { return null; }
}

export async function dispatchContentPush(content: { id: string; title: string; excerpt: string | null; slug: string; kind: string }) {
  const vapid = pushConfiguration();
  if (!vapid) return { attempted: 0, sent: 0, configured: false };
  const client = adminClient();
  const { data: subscriptions } = await client.from("notification_subscriptions").select("id,destination,push_p256dh,push_auth").eq("channel", "web_push").is("revoked_at", null).contains("topics", ["content"]);
  let sent = 0;
  for (const subscription of subscriptions ?? []) {
    if (!subscription.push_p256dh || !subscription.push_auth) continue;
    const details: PushSubscription = { endpoint: subscription.destination, expirationTime: null, keys: { p256dh: subscription.push_p256dh, auth: subscription.push_auth } };
    try {
      const payload = await buildPushPayload({ data: JSON.stringify({ title: content.title, body: content.excerpt || "مادة جديدة منشورة على Alshafra.", url: `/${content.kind === "guide" ? "guides" : content.kind === "tool" ? "tools" : "articles"}/${content.slug}` }), options: { ttl: 3600, urgency: "normal", topic: `content-${content.id}` } }, details, vapid);
      const response = await fetch(subscription.destination, { ...payload, body: payload.body.slice().buffer });
      const invalid = response.status === 404 || response.status === 410;
      await client.from("notification_deliveries").insert({ subscription_id: subscription.id, content_id: content.id, status: response.ok ? "sent" : invalid ? "revoked" : "failed", detail: response.ok ? null : `حالة خدمة الدفع: ${response.status}` });
      if (invalid) await client.from("notification_subscriptions").update({ revoked_at: new Date().toISOString(), last_error: `حالة خدمة الدفع: ${response.status}` }).eq("id", subscription.id);
      else if (response.ok) { await client.from("notification_subscriptions").update({ last_sent_at: new Date().toISOString(), last_error: null }).eq("id", subscription.id); sent += 1; }
    } catch { await client.from("notification_deliveries").insert({ subscription_id: subscription.id, content_id: content.id, status: "failed", detail: "تعذر الاتصال بخدمة الدفع" }); }
  }
  return { attempted: (subscriptions ?? []).length, sent, configured: true };
}
