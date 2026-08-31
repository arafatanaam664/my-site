import type { APIRoute } from "astro";
import { authRedirectUrl } from "../../../lib/auth-redirect";
import { developmentAccessEnabled } from "../../../lib/server/development-access";
import { environmentValues } from "../../../lib/server/runtime";

export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const developmentAccess = developmentAccessEnabled(request);
  const redirectUrl = authRedirectUrl(request);
  const values = environmentValues();
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (values.SUPABASE_URL && values.SUPABASE_PUBLISHABLE_KEY) {
    return new Response(JSON.stringify({ url: values.SUPABASE_URL, publishableKey: values.SUPABASE_PUBLISHABLE_KEY, authRedirectUrl: redirectUrl, developmentAccessEnabled: developmentAccess }), { headers });
  }
  if (developmentAccess) return new Response(JSON.stringify({ authRedirectUrl: redirectUrl, developmentAccessEnabled: true }), { headers });
  const missing = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"].filter((key) => !values[key as "SUPABASE_URL" | "SUPABASE_PUBLISHABLE_KEY"]);
  return new Response(JSON.stringify({ error: "runtime configuration unavailable", missing }), { status: 503, headers: { "content-type": "application/json" } });
};
