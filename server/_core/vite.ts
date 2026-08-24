import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import type { HeadMeta } from "../../client/src/ssr/prefetch";

const canonicalOrigin = (process.env.CANONICAL_ORIGIN ?? "").replace(/\/$/, "");
const siteName = process.env.SITE_NAME ?? "Alshafra";
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const compact = (value: string, limit: number) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
};

function headTags(head: HeadMeta) {
  const title = escapeHtml(compact(head.title || siteName, 70));
  const description = escapeHtml(compact(head.description || "منصة عربية مستقلة للأدوات والمواعيد والأدلة الواضحة.", 190));
  const url = head.canonicalPath && canonicalOrigin ? `${canonicalOrigin}${head.canonicalPath}` : "";
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="${head.ogType ?? "website"}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="ar_AR" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];
  if (url) tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`, `<link rel="canonical" href="${escapeHtml(url)}" />`);
  if (head.notFound || head.noindex) tags.push(`<meta name="robots" content="noindex, follow" />`);
  if (head.schema && url) {
    const schema = head.schema === "article"
      ? { "@context": "https://schema.org", "@type": "Article", headline: head.title, description: head.description, mainEntityOfPage: url, inLanguage: "ar" }
      : { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url, inLanguage: "ar", potentialAction: { "@type": "SearchAction", target: `${canonicalOrigin}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } };
    tags.push(`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`);
  }
  return tags.join("\n");
}

function composeHtml(template: string, appHtml: string, head: HeadMeta, dehydratedState: unknown) {
  const state = JSON.stringify(dehydratedState).replace(/</g, "\\u003c");
  return template
    .replace("</body>", () => `<script>window.__RQ_STATE__ = ${state}</script></body>`)
    .replace("<!--app-head-->", () => headTags(head))
    .replace("<!--app-html-->", () => appHtml);
}

function normalizeHtmlRoute(app: Express) {
  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/ .test(req.path)) {
      const query = req.originalUrl.slice(req.path.length);
      const target = (req.path.replace(/\/+$/, "") || "/").replace(/^\/\/+/, "/");
      return res.redirect(301, `${target}${query}`);
    }
    next();
  });
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({ ...viteConfig, configFile: false, server: { middlewareMode: true, hmr: { server }, allowedHosts: true }, appType: "custom" });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(req.originalUrl, template);
      template = template.replace("</head>", `<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>`);
      const module = await vite.ssrLoadModule("/src/entry-server.tsx");
      const rendered = await module.render(req.originalUrl);
      res.status(rendered.head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, rendered.html, rendered.head, rendered.dehydratedState));
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      console.error("[SSR] dev render failed:", error);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = process.env.NODE_ENV === "development" ? path.resolve(import.meta.dirname, "../..", "dist", "public") : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) console.error("Could not find the build directory. Run the build script before starting production.");
  normalizeHtmlRoute(app);
  app.use(express.static(distPath, { index: false, redirect: false }));
  const templatePath = path.resolve(distPath, "index.html");
  const serverEntryPath = process.env.NODE_ENV === "development" ? path.resolve(import.meta.dirname, "../..", "dist", "server-ssr", "entry-server.js") : path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");
  app.use("*", async (req, res) => {
    try {
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const module = await import(serverEntryPath);
      const rendered = await module.render(req.originalUrl);
      res.status(rendered.head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, rendered.html, rendered.head, rendered.dehydratedState));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const fallback = { title: siteName, description: "منصة عربية مستقلة للأدوات والمواعيد والأدلة الواضحة." };
      res.status(200).set("Cache-Control", "no-cache").type("html").end(template.replace("<!--app-head-->", () => headTags(fallback)).replace("<!--app-html-->", () => ""));
    }
  });
}
