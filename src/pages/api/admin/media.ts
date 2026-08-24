import type { APIRoute } from "astro";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { adminClient, requireEditor } from "../../../lib/server/admin";
import { runtimeSecrets } from "../../../lib/server/runtime";

export const prerender = false;

const allowedTypes = new Set(["image/avif", "image/webp", "image/jpeg", "image/png"]);
const maxBytes = 10 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  try {
    const editor = await requireEditor(request);
    const form = await request.formData();
    const file = form.get("file");
    const altText = String(form.get("altText") ?? "").trim();
    const width = Number(form.get("width"));
    const height = Number(form.get("height"));
    if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size <= 0 || file.size > maxBytes || altText.length < 5 || altText.length > 180 || !Number.isInteger(width) || !Number.isInteger(height) || width < 320 || height < 180) return new Response(JSON.stringify({ error: "ملف الصورة أو وصفها غير صالح" }), { status: 400, headers: { "content-type": "application/json" } });

    const secrets = runtimeSecrets();
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const key = `originals/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const s3 = new S3Client({ region: "auto", endpoint: secrets.R2_ENDPOINT, credentials: { accessKeyId: secrets.R2_ACCESS_KEY_ID, secretAccessKey: secrets.R2_SECRET_ACCESS_KEY } });
    await s3.send(new PutObjectCommand({ Bucket: secrets.R2_BUCKET_NAME, Key: key, Body: new Uint8Array(await file.arrayBuffer()), ContentType: file.type, CacheControl: "public, max-age=31536000, immutable" }));
    const publicUrl = secrets.R2_PUBLIC_BASE_URL ? `${secrets.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : null;
    const { data, error } = await adminClient().from("media_assets").insert({ storage_key: key, public_url: publicUrl, alt_text: altText, mime_type: file.type, width, height, bytes: file.size, created_by: editor.id }).select("id,storage_key,public_url,alt_text,mime_type,width,height,bytes,created_at").single();
    if (error) return new Response(JSON.stringify({ error: "رُفعت الصورة لكن تعذر حفظ بياناتها" }), { status: 500, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ data }), { status: 201, headers: { "content-type": "application/json" } });
  } catch (error) {
    if (error instanceof Response) return error;
    return new Response(JSON.stringify({ error: "تعذر رفع الصورة" }), { status: 500, headers: { "content-type": "application/json" } });
  }
};
