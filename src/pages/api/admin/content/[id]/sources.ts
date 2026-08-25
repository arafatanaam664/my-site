import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../../../lib/server/admin";
import { parseSources } from "../../../../../lib/server/content-sources";
import { canAccessEditorialContent } from "../../../../../lib/server/content-workflow";

export const prerender = false;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

async function editableContent(id: string, userId: string, role: string) {
  const client = adminClient();
  const { data, error } = await client.from("content_items").select("id,status,created_by,title,excerpt,body_markdown,seo_title,seo_description,canonical_url,primary_media_id").eq("id", id).maybeSingle();
  if (error || !data) return { content: null, status: 404 };
  if (!canAccessEditorialContent(role as "admin" | "editor" | "author", userId, data.created_by)) return { content: null, status: 403 };
  if (data.status !== "draft") return { content: null, status: 409 };
  return { content: data, status: 200 };
}

export const GET: APIRoute = async ({ params, request }) => {
  try {
    if (!params.id || !/^[0-9a-f-]{36}$/i.test(params.id)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const result = await editableContent(params.id, editor.id, editor.role);
    if (!result.content) return json({ error: result.status === 403 ? "لا تملك صلاحية هذه المادة" : "لا يمكن إدارة مصادر هذه المادة الآن" }, result.status);
    const { data, error } = await adminClient().from("content_sources").select("note,sources(id,title,url,kind,publisher,published_at,accessed_at)").eq("content_id", params.id);
    if (error) return json({ error: "تعذر تحميل المصادر" }, 500);
    return json({ data });
  } catch (error) { if (error instanceof Response) return error; return json({ error: "تعذر تحميل المصادر" }, 500); }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    if (!params.id || !/^[0-9a-f-]{36}$/i.test(params.id)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const result = await editableContent(params.id, editor.id, editor.role);
    if (!result.content) return json({ error: result.status === 403 ? "لا تملك صلاحية هذه المادة" : "لا يمكن إدارة مصادر هذه المادة الآن" }, result.status);
    const input = await request.json() as { sources?: unknown };
    const sources = parseSources(input.sources);
    if (!sources) return json({ error: "بيانات المصادر غير صالحة" }, 400);
    const client = adminClient();
    const sourceIds: Array<{ source_id: string; note: string | null }> = [];
    for (const source of sources) {
      const { data, error } = await client.from("sources").upsert({ title: source.title, url: source.url, kind: source.kind, publisher: source.publisher, published_at: source.publishedAt, accessed_at: new Date().toISOString() }, { onConflict: "url" }).select("id").single();
      if (error || !data) return json({ error: "تعذر حفظ أحد المصادر" }, 500);
      sourceIds.push({ source_id: data.id, note: source.note });
    }
    const { error: deleteError } = await client.from("content_sources").delete().eq("content_id", result.content.id);
    if (deleteError) return json({ error: "تعذر تحديث روابط المصادر" }, 500);
    if (sourceIds.length) {
      const { error: linkError } = await client.from("content_sources").insert(sourceIds.map((source) => ({ content_id: result.content!.id, ...source })));
      if (linkError) return json({ error: "تعذر ربط المصادر بالمادة" }, 500);
    }
    const { error: revisionError } = await client.from("content_revisions").insert({ content_id: result.content.id, status: "draft", title: result.content.title, excerpt: result.content.excerpt, body_markdown: result.content.body_markdown, seo_title: result.content.seo_title, seo_description: result.content.seo_description, canonical_url: result.content.canonical_url, primary_media_id: result.content.primary_media_id, note: "تحديث مصادر المادة", created_by: editor.id });
    if (revisionError) return json({ error: "حُفظت المصادر لكن تعذر حفظ سجل المراجعة" }, 500);
    return json({ data: { count: sourceIds.length } });
  } catch (error) { if (error instanceof Response) return error; return json({ error: "تعذر حفظ المصادر" }, 500); }
};
