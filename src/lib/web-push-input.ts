export type BrowserPushSubscription = { endpoint: string; expirationTime: number | null; keys: { p256dh: string; auth: string } };
const keyValue = /^[A-Za-z0-9_-]{16,300}$/;

export function parseBrowserSubscription(value: unknown): BrowserPushSubscription | null {
  const input = value as Partial<BrowserPushSubscription>;
  if (!input || typeof input.endpoint !== "string" || input.endpoint.length > 2000 || !input.keys || typeof input.keys.p256dh !== "string" || typeof input.keys.auth !== "string" || !keyValue.test(input.keys.p256dh) || !keyValue.test(input.keys.auth)) return null;
  try { const url = new URL(input.endpoint); if (url.protocol !== "https:") return null; } catch { return null; }
  return { endpoint: input.endpoint, expirationTime: typeof input.expirationTime === "number" ? input.expirationTime : null, keys: { p256dh: input.keys.p256dh, auth: input.keys.auth } };
}
