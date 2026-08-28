import { legalSitemapPaths } from "./site-schema";
import { builtInToolCatalog } from "./tool-catalog";
import type { PublicContentCard } from "./server/public-content";
import { sectionForKind } from "./content-taxonomy";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");

export function renderSitemap(items: PublicContentCard[], origin = "https://alshafra.com") {
  const sections = new Set(items.map((item) => sectionForKind(item.kind)).filter((section): section is string => Boolean(section)));
  const urls = [
    { loc: `${origin}/`, lastmod: undefined as string | undefined },
    { loc: `${origin}/tools`, lastmod: undefined },
    { loc: `${origin}/calendar`, lastmod: undefined },
    { loc: `${origin}/calendar/umm-al-qura`, lastmod: undefined },
    ...builtInToolCatalog.map((tool) => ({ loc: `${origin}${tool.href}`, lastmod: undefined })),
    ...legalSitemapPaths.map((page) => ({ loc: `${origin}/legal/${page}`, lastmod: undefined })),
    ...[...sections].map((section) => ({ loc: `${origin}/${section}`, lastmod: undefined })),
    ...items.flatMap((item) => {
      const section = sectionForKind(item.kind);
      return section ? [{ loc: `${origin}/${section}/${item.slug}`, lastmod: item.updated_at || item.published_at }] : [];
    }),
  ];
  const unique = [...new Map(urls.map((url) => [url.loc, url])).values()];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${unique.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
}
