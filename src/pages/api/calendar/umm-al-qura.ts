import type { APIRoute } from "astro";
import { fetchUmmAlQura, gregorianDateInRiyadh } from "../../../lib/server/umm-al-qura";

export const prerender = false;

export const GET: APIRoute = async () => {
  const date = gregorianDateInRiyadh();
  const cacheKey = new Request(`https://alshafra.com/api/calendar/umm-al-qura?date=${date.year}-${date.month}-${date.day}`);
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  const cached = cache ? await cache.match(cacheKey) : undefined;
  if (cached) return cached;
  const result = await fetchUmmAlQura();
  if (!result) return new Response(JSON.stringify({ error: "تعذر جلب تاريخ أم القرى من المصدر الآن" }), { status: 503, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
  const response = new Response(JSON.stringify({ data: result }), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600" } });
  if (cache) await cache.put(cacheKey, response.clone());
  return response;
};
