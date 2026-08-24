import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerSeoHealth } from "../seoHealth";

const indexablePaths = [
  "/", "/tools", "/tools/date-converter", "/tools/age-calculator", "/tools/date-difference", "/tools/percentage-calculator",
  "/calendar", "/guides", "/guides/understanding-hijri-gregorian-dates", "/guides/calculate-age-correctly",
  "/articles", "/articles/percentage-basics", "/articles/official-dates-and-information", "/about", "/privacy", "/terms", "/contact",
];

const legacyRedirects: Record<string, string> = {
  "/date-converter": "/tools/date-converter",
  "/age-calculator": "/tools/age-calculator",
  "/articles/hijri-to-gregorian-conversion": "/guides/understanding-hijri-gregorian-dates",
};

const retiredLegacyPrefixes = ["/trending", "/gold-price", "/usd-rate", "/countdown"];

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  registerSeoHealth(app);
  app.use((req, res, next) => {
    const target = legacyRedirects[req.path];
    if (target) return res.redirect(301, `${target}${req.originalUrl.slice(req.path.length)}`);
    if (retiredLegacyPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`))) {
      return res.status(410).type("text/plain").send("This legacy page is no longer available.");
    }
    next();
  });
  app.get("/robots.txt", (_req, res) => {
    const origin = (process.env.CANONICAL_ORIGIN ?? "").replace(/\/$/, "");
    const sitemap = origin ? `\nSitemap: ${origin}/sitemap.xml` : "";
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /search${sitemap}\n`);
  });
  app.get("/sitemap.xml", (_req, res) => {
    const origin = (process.env.CANONICAL_ORIGIN ?? "").replace(/\/$/, "");
    if (!origin) return res.status(503).type("text/plain").send("Sitemap is unavailable until CANONICAL_ORIGIN is configured.");
    const entries = indexablePaths.map((entry) => `<url><loc>${origin}${entry}</loc></url>`).join("");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`);
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
