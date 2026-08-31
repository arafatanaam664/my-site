import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const wranglerUrl = new URL("../wrangler.jsonc", import.meta.url);
const packageUrl = new URL("../package.json", import.meta.url);
const docsUrl = new URL("../docs/setup/cloudflare-workers-free-host.md", import.meta.url);
const configUrl = new URL("../src/pages/api/public/config.ts", import.meta.url);

describe("الحفاظ على متغيرات Cloudflare عند النشر", () => {
  it("يبقي متغيرات لوحة التحكم ولا يعتمد على vars فارغة في wrangler", async () => {
    const [wrangler, pkg, docs] = await Promise.all([readFile(wranglerUrl, "utf8"), readFile(packageUrl, "utf8"), readFile(docsUrl, "utf8")]);
    expect(wrangler).toContain('"keep_vars": true');
    expect(wrangler).toContain("nodejs_compat_populate_process_env");
    expect(wrangler).not.toMatch(/"vars"\s*:/);
    expect(pkg).toContain("wrangler deploy --config dist/server/wrangler.json --keep-vars");
    expect(docs).toContain("--keep-vars");
    expect(docs).toContain("Secret");
    const config = await readFile(configUrl, "utf8");
    expect(config).toContain("missing");
    expect(config).toContain("environmentValues()");
    expect(config).not.toContain("publicSupabaseConfig");
  });
});
