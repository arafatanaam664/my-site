import { describe, expect, it } from "vitest";

const accessCode = process.env.DEV_ADMIN_ACCESS_CODE;
const origin = "http://127.0.0.1:3000";

describe("إعداد رمز وصول التطوير", () => {
  it("يفتح جلسة معاينة قصيرة عبر endpoint ثم يلغيها دون كشف الرمز", async () => {
    expect(accessCode?.length).toBeGreaterThanOrEqual(16);
    const response = await fetch(`${origin}/api/admin/development-access`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ code: accessCode }) });
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("alshafra_dev_admin=");
    const close = await fetch(`${origin}/api/admin/development-access`, { method: "DELETE", headers: { origin, cookie: cookie!.split(";")[0] } });
    expect(close.status).toBe(200);
  });

  it("يرفض الرمز على محاكاة النطاق النهائي حتى عند وجوده في بيئة المعاينة", async () => {
    const response = await fetch(`${origin}/api/admin/development-access`, { method: "POST", headers: { "x-forwarded-host": "alshafra.com", "content-type": "application/json" }, body: JSON.stringify({ code: accessCode }) });
    expect(response.status).toBe(401);
  });
});
