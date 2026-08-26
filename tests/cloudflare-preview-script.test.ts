import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const packageUrl = new URL("../package.json", import.meta.url);

describe("معاينة Worker Cloudflare", () => {
  it("تشغل Worker المبني مع أصول العميل بدل Vite preview", async () => {
    const manifest = JSON.parse(await readFile(packageUrl, "utf8")) as { scripts: { dev: string } };
    expect(manifest.scripts.dev).toContain("wrangler dev --config dist/server/wrangler.json");
    expect(manifest.scripts.dev).toContain("astro build &&");
  });
});
