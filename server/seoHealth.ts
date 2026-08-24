import type { Express } from "express";

export function registerSeoHealth(app: Express) {
  app.get("/api/public/seo-health", (_req, res) => {
    const origin = process.env.CANONICAL_ORIGIN ?? "";
    const siteName = process.env.SITE_NAME ?? "";
    let canonicalHost: string | null = null;
    try { canonicalHost = origin ? new URL(origin).host : null; } catch { canonicalHost = null; }
    res.json({ canonicalConfigured: Boolean(canonicalHost), canonicalHost, siteNameConfigured: Boolean(siteName.trim()) });
  });
}
