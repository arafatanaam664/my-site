import type { APIRoute } from "astro";
import { parseSiteNotice } from "../../../../lib/platform-settings";
import { adminClient, requireAdmin } from "../../../../lib/server/admin";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
    const { data, error } = await adminClient().from("platform_settings").select("setting_key,value,visibility,updated_at").order("setting_key");
    return error ? json({ error: "تعذر تحميل إعدادات المنصة" }, 500) : json({ data: data ?? [] });
  } catch (error) { return json({ error: error instanceof Response && error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الإعدادات" }, error instanceof Response ? error.status : 500); }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const actor = await requireAdmin(request);
    const input = await request.json().catch(() => null) as { settingKey?: unknown; value?: unknown } | null;
    if (!input || input.settingKey !== "site_notice") return json({ error: "مفتاح الإعداد غير مسموح" }, 400);
    const value = parseSiteNotice(input.value); if (!value) return json({ error: "بيانات التنبيه العام غير صالحة" }, 400);
    const client = adminClient(); const { data: current, error: currentError } = await client.from("platform_settings").select("value").eq("setting_key", "site_notice").maybeSingle();
    if (currentError || !current) return json({ error: "إعداد المنصة غير موجود" }, 404);
    const { data, error } = await client.from("platform_settings").update({ value, updated_by: actor.id, updated_at: new Date().toISOString() }).eq("setting_key", "site_notice").select("setting_key,value,visibility,updated_at").single();
    if (error || !data) return json({ error: "تعذر حفظ إعداد المنصة" }, 500);
    await client.from("platform_setting_audit").insert({ setting_key: "site_notice", previous_value: current.value, next_value: value, actor_id: actor.id });
    return json({ data });
  } catch (error) { return json({ error: error instanceof Response && error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الإعدادات" }, error instanceof Response ? error.status : 500); }
};
