import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../../lib/server/admin";
import { inlineMediaReferences } from "../../../../lib/server/content-media";
import { canAccessEditorialContent } from "../../../../lib/server/content-workflow";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };
const optionalText = (value: unknown, maximum: number) => {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "string" && value.trim().length <= maximum ? value.trim() : undefined;
};

async function loadOwnedContent(id: string, editorId: string | null, role: string) {
  const client = adminClient();
  const { data, error } = await client.from("content_items").select("id,kind,status,slug,title,excerpt,body_markdown,body_html,seo_title,seo_description,canonical_url,primary_media_id,hub_id,section_id,created_by,updated_at,created_at").eq("id", id).maybeSingle();
  if (error || !data) return { content: null, status: 404 };
  if (!canAccessEditorialContent(role as "admin" | "editor" | "author", editorId, data.created_by)) return { content: null, status: 403 };
  return { content: data, status: 200 };
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const contentId = params.id;
    if (!isUuid(contentId)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const loaded = await loadOwnedContent(contentId, editor.id, editor.role);
    if (!loaded.content) return json({ error: loaded.status === 403 ? "لا تملك صلاحية هذه المادة" : "المادة غير موجودة" }, loaded.status);
    return json({ data: loaded.content });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر تحميل المادة" }, 500);
  }
};

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const contentId = params.id;
    if (!isUuid(contentId)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const loaded = await loadOwnedContent(contentId, editor.id, editor.role);
    if (!loaded.content) return json({ error: loaded.status === 403 ? "لا تملك صلاحية هذه المادة" : "المادة غير موجودة" }, loaded.status);
    if (loaded.content.status !== "draft") return json({ error: "لا يمكن تحرير مادة خرجت من حالة المسودة" }, 409);

    const input = await request.json() as Record<string, unknown>;
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const excerpt = optionalText(input.excerpt, 320);
    const bodyMarkdown = optionalText(input.bodyMarkdown, 100_000);
    const bodyHtml = optionalText(input.bodyHtml, 200_000);
    const hubId = input.hubId === null || input.hubId === "" ? null : input.hubId;
    const sectionId = input.sectionId === null || input.sectionId === "" ? null : input.sectionId;
    const seoTitle = optionalText(input.seoTitle, 60);
    const seoDescription = optionalText(input.seoDescription, 160);
    const canonicalUrl = optionalText(input.canonicalUrl, 500);
    const primaryMediaId = input.primaryMediaId === null || input.primaryMediaId === "" ? null : input.primaryMediaId;
    const note = optionalText(input.note, 500) ?? "تحديث المسودة";
    if (title.length < 15 || title.length > 160 || [excerpt, bodyMarkdown, seoTitle, seoDescription, canonicalUrl].includes(undefined) || !(primaryMediaId === null || isUuid(primaryMediaId)) || !(hubId === null || isUuid(hubId)) || !(sectionId === null || isUuid(sectionId))) return json({ error: "بيانات المسودة غير صالحة" }, 400);
    if (canonicalUrl) {
      try {
        const parsed = new URL(canonicalUrl);
        if (parsed.protocol !== "https:" || parsed.hostname !== "alshafra.com") return json({ error: "الرابط القانوني يجب أن يكون من alshafra.com" }, 400);
      } catch { return json({ error: "الرابط القانوني غير صالح" }, 400); }
    }

    const client = adminClient();
    if (primaryMediaId) {
      const { data: media, error } = await client.from("media_assets").select("id,created_by").eq("id", primaryMediaId).maybeSingle();
      if (error || !media || (editor.role === "author" && media.created_by !== editor.id)) return json({ error: "الصورة الرئيسية غير متاحة لهذا الحساب" }, 400);
    }
    const inlineMedia = inlineMediaReferences(bodyHtml ?? bodyMarkdown ?? null);
    if (inlineMedia.length) {
      const { data: mediaRows, error: inlineMediaError } = await client.from("media_assets").select("id,created_by").in("id", inlineMedia.map((entry) => entry.mediaId));
      if (inlineMediaError || !mediaRows || mediaRows.length !== inlineMedia.length || (editor.role === "author" && mediaRows.some((media) => media.created_by !== editor.id))) return json({ error: "إحدى صور النص غير متاحة لهذا الحساب" }, 400);
    }
    const update = { title, excerpt, body_markdown: bodyMarkdown, seo_title: seoTitle, seo_description: seoDescription, canonical_url: canonicalUrl, primary_media_id: primaryMediaId, updated_by: editor.id, updated_at: new Date().toISOString() };
    const { data: content, error: updateError } = await client.from("content_items").update(update).eq("id", contentId).select("id,kind,status,slug,title,excerpt,body_markdown,seo_title,seo_description,canonical_url,primary_media_id,updated_at").single();
    if (updateError || !content) return json({ error: "تعذر حفظ التعديلات" }, 500);
    if (primaryMediaId) await client.from("content_media").upsert({ content_id: content.id, media_id: primaryMediaId, placement: "primary", position: 0 });
    await client.from("content_media").delete().eq("content_id", content.id).eq("placement", "inline");
    if (inlineMedia.length) {
      const { error: inlineLinkError } = await client.from("content_media").insert(inlineMedia.map((entry) => ({ content_id: content.id, media_id: entry.mediaId, placement: "inline", position: entry.position })));
      if (inlineLinkError) return json({ error: "حُفظ النص لكن تعذر ربط صور النص" }, 500);
    }
    const { error: revisionError } = await client.from("content_revisions").insert({ content_id: content.id, status: "draft", title, excerpt, body_markdown: bodyMarkdown, seo_title: seoTitle, seo_description: seoDescription, canonical_url: canonicalUrl, primary_media_id: primaryMediaId, note, created_by: editor.id });
    if (revisionError) return json({ error: "حُفظت التعديلات لكن تعذر حفظ سجل المراجعة" }, 500);
    return json({ data: content });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر حفظ التعديلات" }, 500);
  }
};
