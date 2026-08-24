import type { APIRoute } from "astro";
import { publicSupabaseConfig } from "../../../lib/server/runtime";

export const prerender = false;

export const GET: APIRoute = () => {
  try {
    return new Response(JSON.stringify(publicSupabaseConfig()), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" } });
  } catch {
    return new Response(JSON.stringify({ error: "runtime configuration unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
  }
};
