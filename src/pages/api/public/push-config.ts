import type { APIRoute } from "astro";
import { pushConfiguration } from "../../../lib/server/web-push";

export const prerender = false;
export const GET: APIRoute = async () => {
  const configuration = pushConfiguration();
  return new Response(JSON.stringify(configuration ? { enabled: true, publicKey: configuration.publicKey } : { enabled: false }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
};
