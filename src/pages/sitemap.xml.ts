import type { APIRoute } from "astro";
import { renderSitemap } from "../lib/sitemap";
import { allPublishedContent } from "../lib/server/public-content";

export const prerender = false;

export const GET: APIRoute = async () => {
  const content = await allPublishedContent();
  return new Response(renderSitemap(content), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
};
