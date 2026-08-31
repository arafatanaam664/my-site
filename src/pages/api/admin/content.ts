import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../lib/server/admin";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireEditor(request);
    const { data, error } = await adminClient().from("content_items").select("id,kind,status,slug,title,published_at,updated_at").order("updated_at", { ascending: false }).limit(100);
    if (error) return json({ error: "تعذر تحميل المحتوى" }, 500);
    return json({ data });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر التحقق من الصلاحيات" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const editor = await requireEditor(request);
    const input = await request.json() as Record<string, unknown>;
    const kind = input.kind;
    const slug = typeof input.slug === "string" ? input.slug.trim() : "";
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : null;
    const bodyMarkdown = typeof input.bodyMarkdown === "string" ? input.bodyMarkdown.trim() : null;
    const bodyHtml = typeof input.bodyHtml === "string" ? input.bodyHtml.trim() : null;
    const hubId = typeof input.hubId === "string" && input.hubId ? input.hubId : null;
    const sectionId = typeof input.sectionId === "string" && input.sectionId ? input.sectionId : null;
    const primaryMediaId = typeof input.primaryMediaId === "string" && input.primaryMediaId ? input.primaryMediaId : null;
    if (!(["article", "guide", "solution", "faq", "news", "page", "tool"] as const).includes(kind as never) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || title.length < 15 || title.length > 160 || (primaryMediaId && !/^[0-9a-f-]{36}$/i.test(primaryMediaId)) || (hubId && !/^[0-9a-f-]{36}$/i.test(hubId)) || (sectionId && !/^[0-9a-f-]{36}$/i.test(sectionId))) return json({ error: "بيانات المسودة غير صالحة" }, 400);

    const client = adminClient();
    if (primaryMediaId) {
      const mediaQuery = client.from("media_assets").select("id,created_by").eq("id", primaryMediaId).maybeSingle();
      const { data: media, error: mediaError } = await mediaQuery;
      if (mediaError || !media || (editor.role !== "admin" && media.created_by !== editor.id)) return json({ error: "الصورة الرئيسية غير متاحة لهذا الحساب" }, 400);
    }
    if (sectionId) {
      const { data: assigned, error: sectionError } = await client.from("site_sections").select("id,parent_id,content_kind").eq("id", sectionId).maybeSingle();
      if (sectionError || !assigned || assigned.parent_id !== hubId || (assigned.content_kind && assigned.content_kind !== kind)) return json({ error: "ربط القسم الرئيسي والفرعي غير صالح" }, 400);
    }
    const { data: content, error: contentError } = await client.from("content_items").insert({ kind, slug, title, excerpt, body_markdown: bodyMarkdown, body_html: bodyHtml, hub_id: hubId, section_id: sectionId, primary_media_id: primaryMediaId, created_by: editor.id, updated_by: editor.id }).select("id,kind,status,slug,title,hub_id,section_id,updated_at").single();
    if (contentError || !content) return json({ error: "تعذر إنشاء المسودة" }, 409);
    if (primaryMediaId) {
      const { error: linkError } = await client.from("content_media").insert({ content_id: content.id, media_id: primaryMediaId, placement: "primary", position: 0 });
      if (linkError) {
        await client.from("content_items").update({ primary_media_id: null }).eq("id", content.id);
        return json({ error: "أُنشئت المسودة لكن تعذر ربط الصورة الرئيسية" }, 500);
      }
    }
    const { error: revisionError } = await client.from("content_revisions").insert({ content_id: content.id, status: "draft", title, excerpt, body_markdown: bodyMarkdown, note: "إنشاء مسودة", created_by: editor.id });
    if (revisionError) return json({ error: "أُنشئت المسودة لكن تعذر حفظ سجل المراجعة" }, 500);
    return json({ data: content }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر إنشاء المسودة" }, 500);
  }
};
