import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../../../lib/server/admin";
import { canAccessEditorialContent } from "../../../../../lib/server/content-workflow";

export const prerender = false;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export const GET: APIRoute = async ({ params, request }) => {
  try {
    if (!params.id || !/^[0-9a-f-]{36}$/i.test(params.id)) return json({ error: "المادة غير موجودة" }, 404);
    const editor = await requireEditor(request);
    const client = adminClient();
    const { data: content, error: contentError } = await client.from("content_items").select("id,created_by").eq("id", params.id).maybeSingle();
    if (contentError || !content) return json({ error: "المادة غير موجودة" }, 404);
    if (!canAccessEditorialContent(editor.role, editor.id, content.created_by)) return json({ error: "لا تملك صلاحية هذه المادة" }, 403);
    const [{ data: revisions, error: revisionError }, { data: events, error: eventError }] = await Promise.all([
      client.from("content_revisions").select("id,status,note,created_at,created_by").eq("content_id", content.id).order("created_at", { ascending: false }).limit(50),
      client.from("content_workflow_events").select("id,from_status,to_status,note,created_at,actor_id").eq("content_id", content.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (revisionError || eventError) return json({ error: "تعذر تحميل سجل المراجعة" }, 500);
    return json({ data: { revisions: revisions ?? [], events: events ?? [] } });
  } catch (error) { if (error instanceof Response) return error; return json({ error: "تعذر تحميل سجل المراجعة" }, 500); }
};
