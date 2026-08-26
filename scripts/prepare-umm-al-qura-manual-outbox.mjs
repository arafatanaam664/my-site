import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const templateName = "مشاركة دليل أم القرى يدويًا";
const templateBody = "دليل جديد من Alshafra\n\n{{title}}\n\n{{excerpt}}\n\n{{url}}";
const { data: content, error: contentError } = await supabase.from("content_items").select("id,kind,title,slug,excerpt,published_at").eq("slug", "umm-al-qura-calendar-guide").eq("status", "published").maybeSingle();
if (contentError || !content?.published_at) throw contentError ?? new Error("الدليل المنشور غير متاح لصندوق التوزيع.");
let { data: template, error: templateLookupError } = await supabase.from("social_post_templates").select("id,body_template").eq("name", templateName).maybeSingle();
if (templateLookupError) throw templateLookupError;
if (!template) {
  const { data, error } = await supabase.from("social_post_templates").insert({ name: templateName, provider: null, body_template: templateBody, enabled: true }).select("id,body_template").single();
  if (error || !data) throw error ?? new Error("تعذر إنشاء قالب التوزيع.");
  template = data;
}
const destinationUrl = `https://alshafra.com/guides/${content.slug}`;
const bodySnapshot = template.body_template.replaceAll("{{title}}", content.title).replaceAll("{{excerpt}}", content.excerpt ?? "").replaceAll("{{url}}", destinationUrl).replace(/\n{3,}/g, "\n\n").trim();
const { data: existing, error: existingError } = await supabase.from("social_outbox").select("id,status").eq("content_id", content.id).eq("template_id", template.id).eq("destination_url", destinationUrl).maybeSingle();
if (existingError) throw existingError;
if (existing) { console.log(JSON.stringify({ status: "already_prepared", outboxId: existing.id, outboxStatus: existing.status })); process.exit(0); }
const { data: outbox, error: outboxError } = await supabase.from("social_outbox").insert({ content_id: content.id, template_id: template.id, body_snapshot: bodySnapshot, destination_url: destinationUrl, status: "ready" }).select("id,status,body_snapshot,destination_url").single();
if (outboxError || !outbox) throw outboxError ?? new Error("تعذر تجهيز المنشور اليدوي.");
const { error: logError } = await supabase.from("social_delivery_log").insert({ outbox_id: outbox.id, action: "created", note: "جُهز من دليل منشور وقالب يدوي؛ لا توجد عملية إرسال خارجية." });
if (logError) throw logError;
await supabase.from("platform_events").insert({ event_type: "social.manual_outbox_ready", aggregate_type: "content", aggregate_id: content.id, payload: { outbox_id: outbox.id, template_id: template.id, mode: "manual_only" } });
console.log(JSON.stringify({ status: "prepared", outboxId: outbox.id, outboxStatus: outbox.status, destinationUrl: outbox.destination_url }));
