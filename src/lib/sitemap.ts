import { legalSitemapPaths } from "./site-schema";
import { builtInToolCatalog } from "./tool-catalog";
import type { PublicContentCard } from "./server/public-content";
import { sectionForKind } from "./content-taxonomy";
import { contentPath, defaultSiteSections, sectionHref } from "./site-sections";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");

type SitemapUrl = { loc: string; lastmod?: string; image?: string; imageTitle?: string };

export function renderSitemap(items: PublicContentCard[], origin = "https://alshafra.com") {
  const sections = new Set(items.map((item) => sectionForKind(item.kind)).filter((section): section is string => Boolean(section)));
  const siteSections = defaultSiteSections();
  const byId = new Map(siteSections.map((record) => [record.id, record]));
  const urls: SitemapUrl[] = [
    { loc: `${origin}/` },
    { loc: `${origin}/tools` },
    { loc: `${origin}/calendar` },
    { loc: `${origin}/calendar/umm-al-qura` },
    ...siteSections.filter((record) => record.enabled && record.publicVisible).map((record) => ({ loc: `${origin}${sectionHref(record, byId)}` })),
    ...builtInToolCatalog.map((tool) => ({ loc: `${origin}${tool.href}` })),
    ...legalSitemapPaths.map((page) => ({ loc: `${origin}/legal/${page}` })),
    ...[...sections].map((section) => ({ loc: `${origin}/${section}` })),
    ...items.flatMap((item) => {
      const section = sectionForKind(item.kind);
      const nested = contentPath(item.kind, item.slug, "calendar", section === "articles" ? "articles" : section === "guides" ? "guides" : section === "solutions" ? "solutions" : section === "news" ? "news" : section === "tools" ? "tools" : null);
      const image = item.primary_media_id ? `${origin}/media/${item.primary_media_id}?preset=hero` : undefined;
      const lastmod = item.updated_at || item.published_at;
      return [
        ...(section ? [{ loc: `${origin}/${section}/${item.slug}`, lastmod, image, imageTitle: item.title }] : []),
        { loc: `${origin}${nested}`, lastmod, image, imageTitle: item.title },
      ];
    }),
  ];
  const unique = [...new Map(urls.map((url) => [url.loc, url])).values()];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${unique.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>` : ""}${url.image ? `<image:image><image:loc>${escapeXml(url.image)}</image:loc><image:title>${escapeXml(url.imageTitle || "")}</image:title></image:image>` : ""}</url>`).join("\n")}\n</urlset>`;
}
