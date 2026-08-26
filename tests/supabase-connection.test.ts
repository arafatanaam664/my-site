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

  it("يتحقق من وجود سجل تدقيق انتقالات المحتوى دون إنشاء حدث", async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/content_workflow_events?select=id,to_status&limit=1`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `لم يمكن الوصول إلى جدول content_workflow_events، حالة HTTP ${response.status}`).toBeLessThan(400);
  });

  it("يتحقق من وجود سجل تسليم إشعارات المتصفح دون إنشاء اشتراك أو إرسال", async () => {
    const response = await fetch(`${supabaseUrl}/rest/v1/notification_deliveries?select=id,status&limit=1`, {
      headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.status, `لم يمكن الوصول إلى جدول notification_deliveries، حالة HTTP ${response.status}`).toBeLessThan(400);
  });

  it("يتحقق من وجود جميع طبقات المنصة المشتركة دون تعديل بيانات", async () => {
    const [typesResponse, categoriesResponse, tagsResponse, entitiesResponse, flagsResponse, auditResponse, eventsResponse, settingsResponse, settingsAuditResponse] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/content_types?select=id,handle&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/content_categories?select=id,slug&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/content_tags?select=id,slug&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/entities?select=id,slug&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/feature_flags?select=flag,enabled&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/feature_flag_audit?select=id,flag&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/platform_events?select=id,event_type&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/platform_settings?select=setting_key,visibility&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
      fetch(`${supabaseUrl}/rest/v1/platform_setting_audit?select=id,setting_key&limit=1`, { headers: { apikey: secretKey!, Authorization: `Bearer ${secretKey!}` }, signal: AbortSignal.timeout(10_000) }),
    ]);
    expect(typesResponse.status, `لم يمكن الوصول إلى جدول content_types، حالة HTTP ${typesResponse.status}`).toBeLessThan(400);
    expect(categoriesResponse.status, `لم يمكن الوصول إلى جدول content_categories، حالة HTTP ${categoriesResponse.status}`).toBeLessThan(400);
    expect(tagsResponse.status, `لم يمكن الوصول إلى جدول content_tags، حالة HTTP ${tagsResponse.status}`).toBeLessThan(400);
    expect(entitiesResponse.status, `لم يمكن الوصول إلى جدول entities، حالة HTTP ${entitiesResponse.status}`).toBeLessThan(400);
    expect(flagsResponse.status, `لم يمكن الوصول إلى جدول feature_flags، حالة HTTP ${flagsResponse.status}`).toBeLessThan(400);
    expect(auditResponse.status, `لم يمكن الوصول إلى جدول feature_flag_audit، حالة HTTP ${auditResponse.status}`).toBeLessThan(400);
    expect(eventsResponse.status, `لم يمكن الوصول إلى جدول platform_events، حالة HTTP ${eventsResponse.status}`).toBeLessThan(400);
    expect(settingsResponse.status, `لم يمكن الوصول إلى جدول platform_settings، حالة HTTP ${settingsResponse.status}`).toBeLessThan(400);
    expect(settingsAuditResponse.status, `لم يمكن الوصول إلى جدول platform_setting_audit، حالة HTTP ${settingsAuditResponse.status}`).toBeLessThan(400);
  });
});
