import type { APIRoute } from "astro";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { adminClient, requireEditor } from "../../../lib/server/admin";
import { inspectSupportedImage, sanitizeAltText, sha256Hex } from "../../../lib/server/image-validation";
import { plannedVariantsFor } from "../../../lib/server/media-variants";
import { runtimeSecrets } from "../../../lib/server/runtime";

export const prerender = false;

const maxBytes = 10 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  try {
    const editor = await requireEditor(request);
    const form = await request.formData();
    const file = form.get("file");
    const altText = sanitizeAltText(form.get("altText"));
    if (!(file instanceof File) || file.size <= 0 || file.size > maxBytes || altText.length < 5 || altText.length > 180) return new Response(JSON.stringify({ error: "ملف الصورة أو وصفها غير صالح" }), { status: 400, headers: { "content-type": "application/json" } });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const image = inspectSupportedImage(bytes);
    if (!image || image.mimeType !== file.type || image.width < 320 || image.height < 180) return new Response(JSON.stringify({ error: "توقيع الصورة أو نوعها أو أبعادها غير صالحة" }), { status: 400, headers: { "content-type": "application/json" } });
    const checksum = await sha256Hex(bytes);

    const secrets = runtimeSecrets();
    const key = `originals/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${image.extension}`;
    const s3 = new S3Client({ region: "auto", endpoint: secrets.R2_ENDPOINT, credentials: { accessKeyId: secrets.R2_ACCESS_KEY_ID, secretAccessKey: secrets.R2_SECRET_ACCESS_KEY } });
    await s3.send(new PutObjectCommand({ Bucket: secrets.R2_BUCKET_NAME, Key: key, Body: bytes, ContentType: image.mimeType, CacheControl: "public, max-age=31536000, immutable" }));
    const publicUrl = secrets.R2_PUBLIC_BASE_URL ? `${secrets.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : null;
    const client = adminClient();
    const { data, error } = await client.from("media_assets").insert({ storage_key: key, public_url: publicUrl, alt_text: altText, mime_type: image.mimeType, width: image.width, height: image.height, bytes: bytes.byteLength, checksum_sha256: checksum, processing_status: "original_only", created_by: editor.id }).select("id,storage_key,public_url,alt_text,mime_type,width,height,bytes,checksum_sha256,processing_status,created_at").single();
    if (error) return new Response(JSON.stringify({ error: "رُفعت الصورة لكن تعذر حفظ بياناتها" }), { status: 500, headers: { "content-type": "application/json" } });
    const { error: variantError } = await client.from("media_variants").insert(plannedVariantsFor(data.id));
    if (variantError) {
      await client.from("media_assets").update({ processing_status: "failed", processing_note: "تعذر إنشاء manifest النسخ المشتقة" }).eq("id", data.id);
      return new Response(JSON.stringify({ error: "رُفعت الصورة لكن تعذر تجهيز نسخ العرض" }), { status: 500, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ data }), { status: 201, headers: { "content-type": "application/json" } });
  } catch (error) {
    if (error instanceof Response) return error;
    return new Response(JSON.stringify({ error: "تعذر رفع الصورة" }), { status: 500, headers: { "content-type": "application/json" } });
  }
};
