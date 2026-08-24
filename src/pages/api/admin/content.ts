import type { APIRoute } from "astro";
import { adminClient, requireEditor } from "../../../lib/server/admin";

export const prerender = false;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

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
    const editor = await requireEditor(request);
    const input = await request.json() as Record<string, unknown>;
    const kind = input.kind;
    const slug = typeof input.slug === "string" ? input.slug.trim() : "";
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : null;
    const bodyMarkdown = typeof input.bodyMarkdown === "string" ? input.bodyMarkdown.trim() : null;
    if (!(["article", "guide", "page", "tool"] as const).includes(kind as never) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || title.length < 15 || title.length > 160) return json({ error: "بيانات المسودة غير صالحة" }, 400);

    const client = adminClient();
    const { data: content, error: contentError } = await client.from("content_items").insert({ kind, slug, title, excerpt, body_markdown: bodyMarkdown, created_by: editor.id, updated_by: editor.id }).select("id,kind,status,slug,title,updated_at").single();
    if (contentError || !content) return json({ error: "تعذر إنشاء المسودة" }, 409);
    const { error: revisionError } = await client.from("content_revisions").insert({ content_id: content.id, status: "draft", title, excerpt, body_markdown: bodyMarkdown, note: "إنشاء مسودة", created_by: editor.id });
    if (revisionError) return json({ error: "أُنشئت المسودة لكن تعذر حفظ سجل المراجعة" }, 500);
    return json({ data: content }, 201);
  } catch (error) {
    if (error instanceof Response) return error;
    return json({ error: "تعذر إنشاء المسودة" }, 500);
  }
};
