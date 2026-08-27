import { createClient } from "@supabase/supabase-js";

const slug = "calculate-date-after-days-leap-year-guide";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: content, error: contentError } = await supabase.from("content_items").select("id,kind,status,slug,title,excerpt,body_markdown,seo_title,seo_description,canonical_url,primary_media_id,published_at").eq("slug", slug).maybeSingle();
if (contentError || !content) throw contentError ?? new Error("لم يُعثر على مسودة الدليل.");
if (content.status === "published") { console.log(JSON.stringify({ status: "already_published", contentId: content.id, publishedAt: content.published_at })); process.exit(0); }
if (!content.primary_media_id || !content.body_markdown || !content.seo_description) throw new Error("لا تفي المسودة بمعايير النشر: يلزم نص ووصف بحث وصورة رئيسة.");
const { count: sourceCount, error: sourceError } = await supabase.from("content_sources").select("source_id", { count: "exact", head: true }).eq("content_id", content.id);
if (sourceError || !sourceCount) throw sourceError ?? new Error("يلزم ربط مصدر موثق قبل النشر.");

const transitions = [
  { status: "in_review", note: "إحالة دليل حساب التاريخ إلى المراجعة التحريرية" },
  { status: "approved", note: "اعتماد المصدر والنص والصورة الرئيسة" },
  { status: "published", note: "نشر دليل حساب التاريخ بعد اكتمال معايير الجودة" },
];
let previousStatus = content.status;
for (const transition of transitions) {
  const publishedAt = transition.status === "published" ? new Date().toISOString() : null;
  const { error: updateError } = await supabase.from("content_items").update({ status: transition.status, published_at: publishedAt, updated_at: new Date().toISOString() }).eq("id", content.id);
  if (updateError) throw updateError;
  const revision = { content_id: content.id, status: transition.status, title: content.title, excerpt: content.excerpt, body_markdown: content.body_markdown, seo_title: content.seo_title, seo_description: content.seo_description, canonical_url: content.canonical_url, primary_media_id: content.primary_media_id, note: transition.note };
  const { error: revisionError } = await supabase.from("content_revisions").insert(revision);
  if (revisionError) throw revisionError;
  const { error: eventError } = await supabase.from("content_workflow_events").insert({ content_id: content.id, from_status: previousStatus, to_status: transition.status, note: transition.note });
  if (eventError) throw eventError;
  previousStatus = transition.status;
}
console.log(JSON.stringify({ status: "published", contentId: content.id, slug: content.slug, path: `/guides/${content.slug}` }));
