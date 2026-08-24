import express from "express";
import type { Server } from "http";
import { afterEach, describe, expect, it } from "vitest";
import { registerSeoHealth } from "./seoHealth";

const originalOrigin = process.env.CANONICAL_ORIGIN;
const originalSiteName = process.env.SITE_NAME;
let server: Server | undefined;

afterEach(async () => {
  if (server) {
    const activeServer = server;
    activeServer.closeAllConnections?.();
    await new Promise<void>((resolve, reject) => activeServer.close((error) => error ? reject(error) : resolve()));
  }
  server = undefined;
  process.env.CANONICAL_ORIGIN = originalOrigin;
  process.env.SITE_NAME = originalSiteName;
});

describe("SEO runtime health", () => {
  it("يعرض أن نطاق canonical واسم المنصة مهيآن عبر endpoint خفيف", async () => {
    process.env.CANONICAL_ORIGIN = "https://alshafra.com";
    process.env.SITE_NAME = "Alshafra";
    const app = express();
    registerSeoHealth(app);
    await new Promise<void>((resolve) => { server = app.listen(0, "127.0.0.1", () => resolve()); });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("لم يبدأ خادم الاختبار");
    const response = await fetch(`http://127.0.0.1:${address.port}/api/public/seo-health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ canonicalConfigured: true, canonicalHost: "alshafra.com", siteNameConfigured: true });
  });
});
