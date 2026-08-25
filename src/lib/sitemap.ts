import type { PublicContentCard } from "./server/public-content";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function renderSitemap(items: PublicContentCard[], origin = "https://alshafra.com") {
  const sectionFor = (kind: string) => ({ article: "articles", guide: "guides", tool: "tools" }[kind] ?? null);
  const sections = new Set(items.map((item) => sectionFor(item.kind)).filter((section): section is string => Boolean(section)));
  const urls = [
    { loc: `${origin}/`, lastmod: undefined },
    ...[...sections].map((section) => ({ loc: `${origin}/${section}`, lastmod: undefined })),
    ...items.flatMap((item) => { const section = sectionFor(item.kind); return section ? [{ loc: `${origin}/${section}/${item.slug}`, lastmod: item.updated_at || item.published_at }] : []; }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(new Date(url.lastmod).toISOString())}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>`;
}
