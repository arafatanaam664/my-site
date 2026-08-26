import type { APIRoute } from "astro";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";
import { parseMediaPreset, transformForPreset } from "../../lib/server/media-preset";
import { runtimeSecrets } from "../../lib/server/runtime";

export const prerender = false;

const cacheHeaders = (mimeType: string, checksum: string) => ({
  "content-type": mimeType,
  "cache-control": "public, max-age=31536000, immutable",
  etag: `"${checksum}"`,
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; sandbox",
});

export const GET: APIRoute = async ({ params, request }) => {
  if (!params.id || !/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("Not found", { status: 404 });

  try {
    const url = new URL(request.url);
    const sourceRequest = url.searchParams.get("source") === "1";
    const preset = parseMediaPreset(url.searchParams.get("preset"));
    if (!sourceRequest && preset) {
      const sourceUrl = new URL(request.url);
      sourceUrl.search = "source=1";
      const transformation = transformForPreset(preset, request.headers.get("accept"));
      return fetch(new Request(sourceUrl, { headers: request.headers }), {
        cf: { image: transformation },
      } as RequestInit);
    }

    const secrets = runtimeSecrets();
    const secureClient = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: links, error: linksError } = await secureClient.from("content_media").select("content_id").eq("media_id", params.id);
    if (linksError || !links?.length) return new Response("Not found", { status: 404 });
    const { data: publishedContent, error: contentError } = await secureClient.from("content_items").select("id").in("id", links.map((link) => link.content_id)).eq("status", "published").lte("published_at", new Date().toISOString()).limit(1);
    if (contentError || !publishedContent?.length) return new Response("Not found", { status: 404 });
    const { data: media, error } = await secureClient
      .from("media_assets")
      .select("storage_key,public_url,mime_type,checksum_sha256")
      .eq("id", params.id)
      .maybeSingle();

    if (error || !media || !media.checksum_sha256) return new Response("Not found", { status: 404 });
    const etag = `"${media.checksum_sha256}"`;
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { etag, "cache-control": "public, max-age=31536000, immutable" } });

    if (media.public_url) {
      const object = await fetch(media.public_url);
      if (!object.ok || !object.body) return new Response("Not found", { status: 404 });
      return new Response(object.body, { headers: cacheHeaders(media.mime_type, media.checksum_sha256) });
    }
    const r2 = new S3Client({
      region: "auto",
      endpoint: secrets.R2_ENDPOINT,
      credentials: { accessKeyId: secrets.R2_ACCESS_KEY_ID, secretAccessKey: secrets.R2_SECRET_ACCESS_KEY },
    });
    const output = await r2.send(new GetObjectCommand({ Bucket: secrets.R2_BUCKET_NAME, Key: media.storage_key }));
    if (!output.Body) return new Response("Not found", { status: 404 });
    return new Response(output.Body as unknown as BodyInit, { headers: cacheHeaders(media.mime_type, media.checksum_sha256) });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
