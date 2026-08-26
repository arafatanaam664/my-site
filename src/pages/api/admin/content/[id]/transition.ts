import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../../../lib/server/admin";
import { canAccessEditorialContent, canTransitionContent, isContentStatus, publicationReadiness } from "../../../../../lib/server/content-workflow";
import { dispatchContentPush } from "../../../../../lib/server/web-push";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const POST: APIRoute = async ({ params, request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    if (!params.id || !/^[0-9a-f-]{36}$/i.test(params.id)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const input = await request.json() as Record<string, unknown>;
    const nextStatus = input.status;
    const note = typeof input.note === "string" ? input.note.trim().slice(0, 500) : null;
    if (!isContentStatus(nextStatus)) return json({ error: "حالة المراجعة غير صالحة" }, 400);

    const client = adminClient();
    const { data: current, error } = await client.from("content_items").select("id,kind,slug,status,created_by,title,excerpt,body_markdown,seo_title,seo_description,canonical_url,primary_media_id").eq("id", params.id).maybeSingle();
    if (error || !current) return json({ error: "المادة غير موجودة" }, 404);
    if (!canAccessEditorialContent(editor.role, editor.id, current.created_by)) return json({ error: "لا تملك صلاحية هذه المادة" }, 403);
    if (!canTransitionContent(editor.role, current.status, nextStatus)) return json({ error: "هذا الانتقال غير مسموح لدورك أو لحالة المادة" }, 409);
    if (nextStatus === "published") {
      const [{ data: primaryMedia }, { count: sourceCount }] = await Promise.all([
        current.primary_media_id ? client.from("media_assets").select("width,height").eq("id", current.primary_media_id).maybeSingle() : Promise.resolve({ data: null }),
        client.from("content_sources").select("source_id", { count: "exact", head: true }).eq("content_id", current.id),
      ]);
      const issues = publicationReadiness({ kind: current.kind, title: current.title, body: current.body_markdown, seoDescription: current.seo_description, primaryMedia, sourceCount: sourceCount ?? 0 });
      if (issues.length) return json({ error: issues.join(". ") }, 400);
    }

    const update = { status: nextStatus, published_at: nextStatus === "published" ? new Date().toISOString() : null, updated_by: editor.id, updated_at: new Date().toISOString() };
    const { data: content, error: updateError } = await client.from("content_items").update(update).eq("id", current.id).select("id,status,published_at,updated_at").single();
    if (updateError || !content) return json({ error: "تعذر تحديث حالة المادة" }, 500);
    const { error: revisionError } = await client.from("content_revisions").insert({ content_id: current.id, status: nextStatus, title: current.title, excerpt: current.excerpt, body_markdown: current.body_markdown, seo_title: current.seo_title, seo_description: current.seo_description, canonical_url: current.canonical_url, primary_media_id: current.primary_media_id, note: note || `نقل الحالة إلى ${nextStatus}`, created_by: editor.id });
    if (revisionError) return json({ error: "تغيرت الحالة لكن تعذر حفظ لقطة المراجعة" }, 500);
    await client.from("content_workflow_events").insert({ content_id: current.id, from_status: current.status, to_status: nextStatus, note, actor_id: editor.id });
    const notification = nextStatus === "published" ? await dispatchContentPush({ id: current.id, title: current.title, excerpt: current.excerpt, slug: current.slug, kind: current.kind }) : null;
    return json({ data: content, notification });
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر تحديث حالة المادة" }, 500);
  }
};
