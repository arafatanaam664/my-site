import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const sourceFile = new URL("../docs/content-drafts/calculate-days-between-dates-article.md", import.meta.url);
const raw = await readFile(sourceFile, "utf8");
const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]+)$/);
if (!match) throw new Error("تعذر قراءة بيانات مسودة المقال.");
const meta = Object.fromEntries(match[1].split("\n").map((line) => { const separator = line.indexOf(": "); return separator > -1 ? [line.slice(0, separator), line.slice(separator + 2)] : [line, ""]; }));
const bodyMarkdown = match[2].trim();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: existing, error: existingError } = await supabase.from("content_items").select("id,status").eq("slug", meta.slug).maybeSingle();
if (existingError) throw existingError;
if (existing) { console.log(JSON.stringify({ status: "already_exists", contentId: existing.id, contentStatus: existing.status })); process.exit(0); }

const canonicalUrl = `https://alshafra.com/articles/${meta.slug}`;
const { data: content, error: contentError } = await supabase.from("content_items").insert({ kind: meta.kind, slug: meta.slug, title: meta.title, excerpt: meta.excerpt, body_markdown: bodyMarkdown, seo_title: meta.seo_title, seo_description: meta.seo_description, canonical_url: canonicalUrl }).select("id,slug,status").single();
if (contentError || !content) throw contentError ?? new Error("تعذر إنشاء مسودة المقال.");

for (const [suffix, note] of [["", "مرجع قاعدة السنة الكبيسة واختلاف التقويم الغريغوري."], ["2", "مرجع طول السنة العادية والسنة الكبيسة."]]) {
  const spec = { url: meta[`source${suffix}_url`], title: meta[`source${suffix}_title`], kind: meta[`source${suffix}_kind`], publisher: meta[`source${suffix}_publisher`] };
  let { data: source, error: lookupError } = await supabase.from("sources").select("id").eq("url", spec.url).maybeSingle();
  if (lookupError) throw lookupError;
  if (!source) {
    const { data: createdSource, error: sourceError } = await supabase.from("sources").insert(spec).select("id").single();
    if (sourceError || !createdSource) throw sourceError ?? new Error("تعذر إنشاء مصدر المقال.");
    source = createdSource;
  }
  const { error: linkError } = await supabase.from("content_sources").insert({ content_id: content.id, source_id: source.id, note });
  if (linkError) throw linkError;
}

const { error: revisionError } = await supabase.from("content_revisions").insert({ content_id: content.id, status: "draft", title: meta.title, excerpt: meta.excerpt, body_markdown: bodyMarkdown, seo_title: meta.seo_title, seo_description: meta.seo_description, canonical_url: canonicalUrl, note: "إنشاء مسودة موثقة لمقال فرق الأيام" });
if (revisionError) throw revisionError;
console.log(JSON.stringify({ status: "draft_created", contentId: content.id, slug: content.slug, contentStatus: content.status, sourceCount: 2 }));
