import type { APIRoute } from "astro";
import { authRedirectUrl } from "../../../lib/auth-redirect";
import { publicSupabaseConfig } from "../../../lib/server/runtime";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  try {
    return new Response(JSON.stringify({ ...publicSupabaseConfig(), authRedirectUrl: authRedirectUrl(request) }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  } catch {
    return new Response(JSON.stringify({ error: "runtime configuration unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  }
};
