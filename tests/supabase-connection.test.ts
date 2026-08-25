import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

describe("اتصال Supabase", () => {
  it("يتحقق من نقطة REST الخفيفة باستخدام المفتاح الخادمي دون عرض السر", async () => {
    expect(supabaseUrl).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(secretKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `فشل اختبار Supabase بحالة HTTP ${response.status}`).toBeLessThan(400);
  });

  it("يتحقق من وجود جدول المحتوى بعد تنفيذ Migration دون إدخال بيانات", async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/content_items?select=id&limit=1`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `لم يمكن الوصول إلى جدول content_items، حالة HTTP ${response.status}`).toBeLessThan(400);
  });

  it("يتحقق من وجود قائمة سماح المحررين دون كشف بياناتها", async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/editor_allowlist?select=email&limit=1`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `لم يمكن الوصول إلى جدول editor_allowlist، حالة HTTP ${response.status}`).toBeLessThan(400);
  });

  it("يتحقق من وجود manifest نسخ الوسائط المشتقة دون إنشاء ملفات", async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/media_variants?select=id,status&limit=1`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `لم يمكن الوصول إلى جدول media_variants، حالة HTTP ${response.status}`).toBeLessThan(400);
  });
});
