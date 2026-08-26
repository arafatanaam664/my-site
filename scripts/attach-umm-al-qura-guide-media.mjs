import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

const slug = "umm-al-qura-calendar-guide";
const localFile = "/home/ubuntu/webdev-static-assets/umm-al-qura-guide-cover.jpg";
const altText = "تقويم هجري مفتوح مع هلال ولمحة تجريدية لمكة المكرمة";

function pngDimensions(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((value, index) => bytes[index] === value) || bytes.length < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

const env = process.env;
const required = ["SUPABASE_URL", "SUPABASE_SECRET_KEY", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"];
if (required.some((key) => !env[key])) throw new Error("إعدادات التخزين أو قاعدة البيانات الخادمية غير متاحة.");
const bytes = new Uint8Array(await readFile(localFile));
const dimensions = pngDimensions(bytes);
if (!dimensions || dimensions.width < 320 || dimensions.height < 180) throw new Error("ملف الصورة غير جاهز أو لا يطابق الحد الأدنى للأبعاد.");
const checksum = createHash("sha256").update(bytes).digest("hex");
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: content, error: contentError } = await supabase.from("content_items").select("id,primary_media_id,title,excerpt,body_markdown,seo_title,seo_description,canonical_url").eq("slug", slug).maybeSingle();
if (contentError || !content) throw contentError ?? new Error("لم يُعثر على مسودة الدليل.");
if (content.primary_media_id) { console.log(JSON.stringify({ status: "already_attached", contentId: content.id, mediaId: content.primary_media_id })); process.exit(0); }

const storageKey = `originals/${new Date().toISOString().slice(0, 10)}/umm-al-qura-guide-cover-${checksum.slice(0, 12)}.png`;
const r2 = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } });
await r2.send(new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: storageKey, Body: bytes, ContentType: "image/png", CacheControl: "public, max-age=31536000, immutable" }));
const publicUrl = env.R2_PUBLIC_BASE_URL ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${storageKey}` : null;
const { data: media, error: mediaError } = await supabase.from("media_assets").insert({ storage_key: storageKey, public_url: publicUrl, alt_text: altText, mime_type: "image/png", width: dimensions.width, height: dimensions.height, bytes: bytes.byteLength, checksum_sha256: checksum, processing_status: "original_only", processing_note: "صورة رئيسية مولدة للدليل، محفوظة بصيغتها الأصلية." }).select("id,public_url,storage_key").single();
if (mediaError || !media) throw mediaError ?? new Error("تعذر تسجيل بيانات الصورة.");
const { error: updateError } = await supabase.from("content_items").update({ primary_media_id: media.id, updated_at: new Date().toISOString() }).eq("id", content.id);
if (updateError) throw updateError;
const { error: linkError } = await supabase.from("content_media").insert({ content_id: content.id, media_id: media.id, placement: "primary", position: 0 });
if (linkError) throw linkError;
const { error: revisionError } = await supabase.from("content_revisions").insert({ content_id: content.id, status: "draft", title: content.title, excerpt: content.excerpt, body_markdown: content.body_markdown, seo_title: content.seo_title, seo_description: content.seo_description, canonical_url: content.canonical_url, primary_media_id: media.id, note: "إضافة الصورة الرئيسية للدليل" });
if (revisionError) throw revisionError;
console.log(JSON.stringify({ status: "media_attached", contentId: content.id, mediaId: media.id, width: dimensions.width, height: dimensions.height, publicUrl: media.public_url }));
