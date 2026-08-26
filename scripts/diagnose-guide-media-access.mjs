import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const mediaId = "c7dd0bb1-2e61-4bf3-aec7-4da52cd8374b";
const links = await supabase.from("content_media").select("content_id").eq("media_id", mediaId);
const contentIds = (links.data ?? []).map((entry) => entry.content_id);
const published = contentIds.length ? await supabase.from("content_items").select("id,status,published_at").in("id", contentIds).eq("status", "published").lte("published_at", new Date().toISOString()).limit(1) : { data: [], error: null };
const media = await supabase.from("media_assets").select("id,storage_key,mime_type,checksum_sha256").eq("id", mediaId).maybeSingle();
console.log(JSON.stringify({ links: { count: links.data?.length ?? 0, error: links.error?.message ?? null }, published: { count: published.data?.length ?? 0, error: published.error?.message ?? null }, media: { found: Boolean(media.data), error: media.error?.message ?? null } }));
