import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const adminPageUrl = new URL("../src/pages/admin/index.astro", import.meta.url);
const runtimeUrl = new URL("../src/lib/server/runtime.ts", import.meta.url);

describe("رسائل دخول الإدارة وإعداد المعاينة", () => {
  it("يعالج حالات Auth الشائعة ويقرأ إعداد Supabase العام المخصص للمعاينة", async () => {
    const [adminPage, runtime] = await Promise.all([readFile(adminPageUrl, "utf8"), readFile(runtimeUrl, "utf8")]);
    expect(adminPage).toContain("email_provider_disabled");
    expect(adminPage).toContain("over_email_send_rate_limit");
    expect(adminPage).toContain("loginErrorMessage(error)");
    expect(adminPage).toContain("تحتاج مساحة الإدارة إلى JavaScript");
    expect(adminPage).toContain("<noscript>");
    expect(adminPage).not.toContain("onsubmit=");
    expect(adminPage).toContain("دخول التطوير المؤقت");
    expect(adminPage).toContain("/api/admin/development-access");
    expect(adminPage).toContain("/api/admin/platform/settings");
    expect(runtime).toContain("VITE_SUPABASE_URL");
    expect(runtime).toContain("VITE_SUPABASE_PUBLISHABLE_KEY");
  });
});
