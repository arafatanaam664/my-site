import type { APIRoute } from "astro";
import { isPlatformFeatureFlag } from "../../../../lib/platform-foundation";
import { adminClient, requireAdmin } from "../../../../lib/server/admin";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
    const { data, error } = await adminClient().from("feature_flags").select("flag,label,enabled,public_visible,config,updated_at").order("flag");
    if (error) return json({ error: "تعذر تحميل مفاتيح الميزات" }, 500);
    return json({ data: data ?? [] });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الميزات" }, error.status);
    return json({ error: "تعذر تحميل مفاتيح الميزات" }, 500);
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const actor = await requireAdmin(request);
    const payload = await request.json().catch(() => null) as { flag?: unknown; enabled?: unknown; note?: unknown } | null;
    if (!payload || !isPlatformFeatureFlag(payload.flag) || typeof payload.enabled !== "boolean") return json({ error: "بيانات مفتاح الميزة غير صالحة" }, 400);
    const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 500) : null;
    const client = adminClient();
    const { data: current, error: readError } = await client.from("feature_flags").select("flag,enabled").eq("flag", payload.flag).maybeSingle();
    if (readError || !current) return json({ error: "مفتاح الميزة غير موجود" }, 404);
    const { data, error } = await client.from("feature_flags").update({ enabled: payload.enabled, updated_by: actor.id, updated_at: new Date().toISOString() }).eq("flag", payload.flag).select("flag,label,enabled,public_visible,config,updated_at").single();
    if (error || !data) return json({ error: "تعذر تحديث مفتاح الميزة" }, 500);
    if (current.enabled !== payload.enabled) await client.from("feature_flag_audit").insert({ flag: payload.flag, previous_enabled: current.enabled, next_enabled: payload.enabled, note, actor_id: actor.id });
    return json({ data });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الميزات" }, error.status);
    return json({ error: "تعذر تحديث مفتاح الميزة" }, 500);
  }
};
