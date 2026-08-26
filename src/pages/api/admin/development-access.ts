import type { APIRoute } from "astro";
import { clearDevelopmentSession, createDevelopmentSession, developmentAccessEnabled, developmentAdminIdentity } from "../../../lib/server/development-access";

export const prerender = false;
const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => json({ data: { enabled: developmentAccessEnabled(request), authenticated: Boolean(await developmentAdminIdentity(request)) } });

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
  const body = await request.json().catch(() => null) as { code?: unknown } | null;
  if (!body || typeof body.code !== "string" || body.code.length < 16) return json({ error: "رمز الوصول غير صالح" }, 400);
  const session = await createDevelopmentSession(request, body.code);
  if (!session) return json({ error: "رمز الوصول غير صحيح أو غير متاح في هذه البيئة" }, 401);
  return json({ data: { authenticated: true }, message: "تم فتح جلسة تطوير مؤقتة." }, 200, { "set-cookie": session });
};

export const DELETE: APIRoute = ({ request }) => json({ data: { authenticated: false } }, 200, { "set-cookie": clearDevelopmentSession(request) });
