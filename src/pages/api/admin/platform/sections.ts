import type { APIRoute } from "astro";
import { adminClient, requireAdmin } from "../../../../lib/server/admin";
import { loadSiteSections } from "../../../../lib/server/site-sections";
import { isEditorialKind, isReservedSectionSlug, isSectionSlug } from "../../../../lib/site-sections";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };
const slugOk = (value: unknown) => typeof value === "string" && isSectionSlug(value);
const titleOk = (value: unknown) => typeof value === "string" && value.trim().length >= 2 && value.trim().length <= 100;

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
    return json({ data: await loadSiteSections() });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الأقسام" }, error.status);
    return json({ error: "تعذر تحميل الأقسام" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    await requireAdmin(request);
    const input = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!input || !slugOk(input.slug) || !titleOk(input.title)) return json({ error: "بيانات القسم غير صالحة" }, 400);
    const slug = String(input.slug);
    const parentId = typeof input.parentId === "string" && input.parentId ? input.parentId : null;
    if (!parentId && isReservedSectionSlug(slug) && slug !== "calendar" && slug !== "community") return json({ error: "هذا المسار محجوز في المنصة" }, 400);
    const contentKind = input.contentKind == null || input.contentKind === "" ? null : input.contentKind;
    if (parentId && !isEditorialKind(contentKind)) return json({ error: "القسم الفرعي يحتاج إلى نوع محتوى" }, 400);
    if (!parentId && contentKind) return json({ error: "القسم الرئيسي لا يُربط بنوع محتوى مباشر" }, 400);
    const client = adminClient();
    const { data, error } = await client.from("site_sections").insert({
      slug,
      title: String(input.title).trim(),
      description: typeof input.description === "string" ? input.description.trim().slice(0, 320) : null,
      parent_id: parentId,
      content_kind: contentKind,
      nav_order: typeof input.navOrder === "number" ? input.navOrder : 100,
      enabled: input.enabled === true,
      public_visible: input.publicVisible !== false,
      destination_path: typeof input.destinationPath === "string" && input.destinationPath.startsWith("/") ? input.destinationPath : null,
    }).select("id,slug,title,description,parent_id,content_kind,nav_order,enabled,public_visible,system_key,destination_path").single();
    if (error || !data) return json({ error: "تعذر إنشاء القسم. تحقق من تطبيق ترحيل الأقسام في قاعدة البيانات." }, 500);
    return json({ data }, 201);
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الأقسام" }, error.status);
    return json({ error: "تعذر إنشاء القسم" }, 500);
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    await requireAdmin(request);
    const input = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!input || typeof input.id !== "string") return json({ error: "بيانات القسم غير صالحة" }, 400);
    const client = adminClient();
    const { data: current, error: readError } = await client.from("site_sections").select("id,system_key,parent_id").eq("id", input.id).maybeSingle();
    if (readError || !current) return json({ error: "القسم غير موجود" }, 404);
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (titleOk(input.title)) update.title = String(input.title).trim();
    if (typeof input.description === "string") update.description = input.description.trim().slice(0, 320);
    if (typeof input.enabled === "boolean") update.enabled = input.enabled;
    if (typeof input.publicVisible === "boolean") update.public_visible = input.publicVisible;
    if (typeof input.navOrder === "number") update.nav_order = input.navOrder;
    if (!current.system_key && slugOk(input.slug)) update.slug = input.slug;
    if (input.contentKind === null || isEditorialKind(input.contentKind)) update.content_kind = input.contentKind ?? null;
    const { data, error } = await client.from("site_sections").update(update).eq("id", input.id).select("id,slug,title,description,parent_id,content_kind,nav_order,enabled,public_visible,system_key,destination_path").single();
    if (error || !data) return json({ error: "تعذر حفظ القسم" }, 500);
    return json({ data });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الأقسام" }, error.status);
    return json({ error: "تعذر حفظ القسم" }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    await requireAdmin(request);
    const input = await request.json().catch(() => null) as { id?: unknown } | null;
    if (!input || typeof input.id !== "string") return json({ error: "بيانات القسم غير صالحة" }, 400);
    const client = adminClient();
    const { data: current, error: readError } = await client.from("site_sections").select("id,system_key").eq("id", input.id).maybeSingle();
    if (readError || !current) return json({ error: "القسم غير موجود" }, 404);
    if (current.system_key) return json({ error: "لا يمكن حذف قسم نظامي؛ يمكن إيقاف ظهوره." }, 409);
    const { error } = await client.from("site_sections").delete().eq("id", input.id);
    if (error) return json({ error: "تعذر حذف القسم" }, 500);
    return json({ data: { id: input.id } });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة الأقسام" }, error.status);
    return json({ error: "تعذر حذف القسم" }, 500);
  }
};
