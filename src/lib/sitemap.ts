import { legalSitemapPaths } from "./site-schema";
import { builtInToolCatalog } from "./tool-catalog";
import type { PublicContentCard } from "./server/public-content";
import { sectionForKind } from "./content-taxonomy";
import { contentPath, defaultSiteSections, sectionHref } from "./site-sections";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");

export function renderSitemap(items: PublicContentCard[], origin = "https://alshafra.com") {
  const sections = new Set(items.map((item) => sectionForKind(item.kind)).filter((section): section is string => Boolean(section)));
  const siteSections = defaultSiteSections();
  const byId = new Map(siteSections.map((record) => [record.id, record]));
  const urls = [
    { loc: `${origin}/`, lastmod: undefined as string | undefined },
    { loc: `${origin}/tools`, lastmod: undefined },
    { loc: `${origin}/calendar`, lastmod: undefined },
    { loc: `${origin}/calendar/umm-al-qura`, lastmod: undefined },
    ...siteSections.filter((record) => record.enabled && record.publicVisible).map((record) => ({ loc: `${origin}${sectionHref(record, byId)}`, lastmod: undefined })),
    ...builtInToolCatalog.map((tool) => ({ loc: `${origin}${tool.href}`, lastmod: undefined })),
    ...legalSitemapPaths.map((page) => ({ loc: `${origin}/legal/${page}`, lastmod: undefined })),
    ...[...sections].map((section) => ({ loc: `${origin}/${section}`, lastmod: undefined })),
    ...items.flatMap((item) => {
      const section = sectionForKind(item.kind);
      const nested = contentPath(item.kind, item.slug, "calendar", section === "articles" ? "articles" : section === "guides" ? "guides" : section === "solutions" ? "solutions" : section === "news" ? "news" : section === "tools" ? "tools" : null);
      return [
        ...(section ? [{ loc: `${origin}/${section}/${item.slug}`, lastmod: item.updated_at || item.published_at }] : []),
        { loc: `${origin}${nested}`, lastmod: item.updated_at || item.published_at },
      ];
    }),
  ];
  const unique = [...new Map(urls.map((url) => [url.loc, url])).values()];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
}
