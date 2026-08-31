import type { APIRoute } from "astro";
import { clearDevelopmentSession, createDevelopmentSession, developmentAccessEnabled, developmentAdminIdentity } from "../../../lib/server/development-access";

export const prerender = false;
const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const sameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || new URL(request.url).host;
  try {
    const originHost = new URL(origin).host;
    return originHost === host || originHost === host.replace(/:\d+$/, "") || host.startsWith(originHost);
  } catch {
    return false;
  }
};

export const GET: APIRoute = async ({ request }) => json({ data: { enabled: developmentAccessEnabled(request), authenticated: Boolean(await developmentAdminIdentity(request)) } });

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
  const body = await request.json().catch(() => null) as { code?: unknown } | null;
  if (!body || typeof body.code !== "string" || body.code.length < 16) return json({ error: "رمز الوصول غير صالح" }, 400);
  const session = await createDevelopmentSession(request, body.code);
  if (!session) return json({ error: "رمز الوصول غير صحيح أو غير متاح في هذه البيئة" }, 401);
  return json({ data: { authenticated: true, token: session.token }, message: "تم فتح جلسة تطوير مؤقتة." }, 200, { "set-cookie": session.cookie });
};

export const DELETE: APIRoute = ({ request }) => json({ data: { authenticated: false } }, 200, { "set-cookie": clearDevelopmentSession(request) });
