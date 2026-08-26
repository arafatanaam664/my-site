import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const packageUrl = new URL("../package.json", import.meta.url);

describe("معاينة Worker Cloudflare", () => {
  it("تشغل Worker المبني مع أصول العميل بدل Vite preview", async () => {
    const manifest = JSON.parse(await readFile(packageUrl, "utf8")) as { scripts: { dev: string } };
    expect(manifest.scripts.dev).toContain("wrangler dev --config dist/server/wrangler.json");
    expect(manifest.scripts.dev).toContain("astro build &&");
    expect(manifest.scripts.dev).toContain("--var SUPABASE_URL:$SUPABASE_URL");
    expect(manifest.scripts.dev).toContain("--var SUPABASE_PUBLISHABLE_KEY:$SUPABASE_PUBLISHABLE_KEY");
    expect(manifest.scripts.dev).toContain("--var SUPABASE_SECRET_KEY:$SUPABASE_SECRET_KEY");
    expect(manifest.scripts.dev).toContain("--var R2_ENDPOINT:$R2_ENDPOINT");
    expect(manifest.scripts.dev).toContain("--var R2_ACCESS_KEY_ID:$R2_ACCESS_KEY_ID");
    expect(manifest.scripts.dev).toContain("--var R2_SECRET_ACCESS_KEY:$R2_SECRET_ACCESS_KEY");
    expect(manifest.scripts.dev).toContain("--var R2_BUCKET_NAME:$R2_BUCKET_NAME");
  });
});
