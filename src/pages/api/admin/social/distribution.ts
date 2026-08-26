import type { APIRoute } from "astro";
import { renderSocialTemplate } from "../../../../lib/social-distribution";
import { adminClient, requireAdmin } from "../../../../lib/server/admin";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const providers = new Set(["x", "facebook", "instagram", "linkedin", "telegram", "whatsapp_channel", "other"]);
const isUuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value);
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
    const client = adminClient();
    const [accounts, templates, outbox, activity, publishedContent] = await Promise.all([
      client.from("social_accounts").select("id,provider,display_name,external_account_ref,connection_status,updated_at").order("updated_at", { ascending: false }),
      client.from("social_post_templates").select("id,name,provider,body_template,enabled,updated_at").order("updated_at", { ascending: false }),
      client.from("social_outbox").select("id,content_id,account_id,template_id,body_snapshot,destination_url,status,created_at").order("created_at", { ascending: false }).limit(30),
      client.from("social_delivery_log").select("id,outbox_id,action,note,created_at").order("created_at", { ascending: false }).limit(30),
      client.from("content_items").select("id,kind,title,slug,excerpt,published_at").eq("status", "published").lte("published_at", new Date().toISOString()).in("kind", ["article", "guide", "tool"]).order("published_at", { ascending: false }).limit(30),
    ]);
    if (accounts.error || templates.error || outbox.error || activity.error || publishedContent.error) return json({ error: "تعذر تحميل مساحة التوزيع" }, 500);
    return json({ data: { accounts: accounts.data ?? [], templates: templates.data ?? [], outbox: outbox.data ?? [], activity: activity.data ?? [], publishedContent: publishedContent.data ?? [] } });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة التوزيع" }, error.status);
    return json({ error: "تعذر تحميل مساحة التوزيع" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const actor = await requireAdmin(request);
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload || typeof payload.action !== "string") return json({ error: "بيانات الإجراء غير صالحة" }, 400);
    if (payload.action === "create_account") {
      const provider = typeof payload.provider === "string" && providers.has(payload.provider) ? payload.provider : null; const displayName = typeof payload.displayName === "string" ? payload.displayName.trim() : ""; const externalRef = typeof payload.externalAccountRef === "string" ? payload.externalAccountRef.trim() : null; const connectionStatus = payload.connectionStatus === "ready" || payload.connectionStatus === "paused" ? payload.connectionStatus : "disconnected";
      if (!provider || displayName.length < 2 || displayName.length > 120 || (externalRef && externalRef.length > 240)) return json({ error: "بيانات الحساب المرجعي غير صالحة" }, 400);
      const client = adminClient();
      const { data, error } = await client.from("social_accounts").insert({ provider, display_name: displayName, external_account_ref: externalRef || null, connection_status: connectionStatus }).select("id,provider,display_name,external_account_ref,connection_status,updated_at").single();
      if (error || !data) return json({ error: "تعذر حفظ الحساب المرجعي" }, 500);
      return json({ data }, 201);
    }
    if (payload.action === "create_template") {
      const name = typeof payload.name === "string" ? payload.name.trim() : ""; const body = typeof payload.bodyTemplate === "string" ? payload.bodyTemplate.trim() : ""; const provider = typeof payload.provider === "string" && providers.has(payload.provider) ? payload.provider : null;
      if (name.length < 2 || name.length > 100 || body.length < 20 || body.length > 5000) return json({ error: "اسم القالب أو نصه غير صالح" }, 400);
      const client = adminClient();
      const { data, error } = await client.from("social_post_templates").insert({ name, provider, body_template: body, created_by: actor.id ?? null }).select("id,name,provider,body_template,enabled,updated_at").single();
      if (error || !data) return json({ error: "تعذر حفظ القالب" }, 500);
      return json({ data }, 201);
    }
    if (payload.action === "create_outbox") {
      const body = typeof payload.bodySnapshot === "string" ? payload.bodySnapshot.trim() : ""; const destinationUrl = typeof payload.destinationUrl === "string" ? payload.destinationUrl.trim() : null; const status = payload.status === "ready" ? "ready" : "draft";
      if (!body || body.length > 5000 || (destinationUrl && !/^https:\/\//.test(destinationUrl))) return json({ error: "نص المنشور أو رابطه غير صالح" }, 400);
      const client = adminClient();
      const { data, error } = await client.from("social_outbox").insert({ body_snapshot: body, destination_url: destinationUrl || null, status, content_id: isUuid(payload.contentId) ? payload.contentId : null, account_id: isUuid(payload.accountId) ? payload.accountId : null, template_id: isUuid(payload.templateId) ? payload.templateId : null, created_by: actor.id ?? null }).select("id,body_snapshot,destination_url,status,created_at").single();
      if (error || !data) return json({ error: "تعذر إضافة المنشور إلى الصندوق" }, 500);
      await client.from("social_delivery_log").insert({ outbox_id: data.id, action: "created", actor_id: actor.id ?? null });
      return json({ data }, 201);
    }
    if (payload.action === "create_outbox_from_template" && isUuid(payload.contentId) && isUuid(payload.templateId)) {
      const client = adminClient();
      const [contentResult, templateResult] = await Promise.all([
        client.from("content_items").select("id,kind,title,slug,excerpt,published_at").eq("id", payload.contentId).eq("status", "published").lte("published_at", new Date().toISOString()).in("kind", ["article", "guide", "tool"]).maybeSingle(),
        client.from("social_post_templates").select("id,body_template,enabled").eq("id", payload.templateId).eq("enabled", true).maybeSingle(),
      ]);
      if (contentResult.error || templateResult.error || !contentResult.data || !templateResult.data) return json({ error: "اختر مادة منشورة وقالبًا مفعّلًا" }, 400);
      const section = ({ article: "articles", guide: "guides", tool: "tools" } as Record<string, string | undefined>)[contentResult.data.kind];
      if (!section) return json({ error: "نوع المادة غير صالح للتوزيع العام" }, 400);
      const destinationUrl = `https://alshafra.com/${section}/${contentResult.data.slug}`;
      const bodySnapshot = renderSocialTemplate(templateResult.data.body_template, { title: contentResult.data.title, excerpt: contentResult.data.excerpt, url: destinationUrl });
      if (!bodySnapshot || bodySnapshot.length > 5000) return json({ error: "نتيجة القالب غير صالحة" }, 400);
      const { data, error } = await client.from("social_outbox").insert({ content_id: contentResult.data.id, account_id: isUuid(payload.accountId) ? payload.accountId : null, template_id: templateResult.data.id, body_snapshot: bodySnapshot, destination_url: destinationUrl, status: "ready", created_by: actor.id ?? null }).select("id,body_snapshot,destination_url,status,created_at").single();
      if (error || !data) return json({ error: "تعذر تجهيز المنشور من القالب" }, 500);
      await client.from("social_delivery_log").insert({ outbox_id: data.id, action: "created", note: "جُهز من مادة منشورة وقالب", actor_id: actor.id ?? null });
      return json({ data }, 201);
    }
    if (payload.action === "mark_copied" && isUuid(payload.outboxId)) {
      const client = adminClient();
      const { data, error } = await client.from("social_outbox").update({ status: "copied", updated_at: new Date().toISOString() }).eq("id", payload.outboxId).select("id,status").single();
      if (error || !data) return json({ error: "تعذر تحديث حالة المنشور" }, 500);
      await client.from("social_delivery_log").insert({ outbox_id: data.id, action: "copied_for_manual_publish", actor_id: actor.id ?? null });
      return json({ data });
    }
    return json({ error: "إجراء التوزيع غير مدعوم" }, 400);
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة التوزيع" }, error.status);
    return json({ error: "تعذر تنفيذ إجراء التوزيع" }, 500);
  }
};
