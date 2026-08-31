import type { APIRoute } from "astro";
import { authRedirectUrl } from "../../../lib/auth-redirect";
import { developmentAccessEnabled } from "../../../lib/server/development-access";
import { publicSupabaseConfig } from "../../../lib/server/runtime";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const developmentAccess = developmentAccessEnabled(request);
  const redirectUrl = authRedirectUrl(request);
  try {
    return new Response(JSON.stringify({ ...publicSupabaseConfig(), authRedirectUrl: redirectUrl, developmentAccessEnabled: developmentAccess }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch {
    if (developmentAccess) return new Response(JSON.stringify({ authRedirectUrl: redirectUrl, developmentAccessEnabled: true }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    return new Response(JSON.stringify({ error: "runtime configuration unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  }
};
