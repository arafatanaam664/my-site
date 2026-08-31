import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const runtimeUrl = new URL("../src/lib/server/runtime.ts", import.meta.url);
const proxyUrl = new URL("../scripts/preview-proxy.mjs", import.meta.url);

describe("اتصال المعاينة بـ Supabase دون صور", () => {
  it("يعتبر مفاتيح Supabase وحدها مطلوبة في وقت التشغيل", async () => {
    const source = await readFile(runtimeUrl, "utf8");
    expect(source).toContain('const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"]');
    expect(source).toContain("export function requireMediaSecrets()");
    expect(source).toContain("export async function timedFetch");
    expect(source).toContain("readBinding(env, key)");
    expect(source).not.toContain("Object.entries(env");
  });

  it("يحمّل معاينة Worker مفاتيح Supabase من ملف البيئة المحلي", async () => {
    const source = await readFile(proxyUrl, "utf8");
    expect(source).toContain("../.preview.env");
    expect(source).toContain("../.env");
    expect(source).toContain("SUPABASE_URL");
    expect(source).toContain("SUPABASE_PUBLISHABLE_KEY");
    expect(source).toContain("SUPABASE_SECRET_KEY");
    expect(source).toContain("DEV_ADMIN_ACCESS_CODE");
  });
});
