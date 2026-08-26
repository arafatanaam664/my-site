import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const raw = await readFile(new URL("../docs/content-drafts/umm-al-qura-calendar-guide.md", import.meta.url), "utf8");
const match = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]+)$/);
if (!match) throw new Error("تعذر قراءة نص الدليل.");
const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: content, error: lookupError } = await supabase.from("content_items").select("id,status,title,excerpt,seo_title,seo_description,canonical_url,primary_media_id").eq("slug", "umm-al-qura-calendar-guide").maybeSingle();
if (lookupError || !content) throw lookupError ?? new Error("لم يُعثر على الدليل المنشور.");
const bodyMarkdown = match[1].trim();
const { error: updateError } = await supabase.from("content_items").update({ body_markdown: bodyMarkdown, updated_at: new Date().toISOString() }).eq("id", content.id);
if (updateError) throw updateError;
const { error: revisionError } = await supabase.from("content_revisions").insert({ content_id: content.id, status: content.status, title: content.title, excerpt: content.excerpt, body_markdown: bodyMarkdown, seo_title: content.seo_title, seo_description: content.seo_description, canonical_url: content.canonical_url, primary_media_id: content.primary_media_id, note: "تنقيح النص لعرض الروابط والمصدر ضمن المكونات الآمنة" });
if (revisionError) throw revisionError;
console.log(JSON.stringify({ status: "body_refreshed", contentId: content.id }));
