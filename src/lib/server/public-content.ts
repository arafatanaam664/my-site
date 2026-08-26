import { createClient } from "@supabase/supabase-js";
import { runtimeSecrets } from "./runtime";

export type PublicContentKind = "article" | "guide" | "tool" | "page";
export type PublicMedia = { id: string; alt_text: string; width: number; height: number; mime_type: string };
export type PublicContent = {
  id: string;
  kind: PublicContentKind;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  primary_media_id: string | null;
  published_at: string;
  updated_at: string;
  media: PublicMedia[];
  sources: Array<{ title: string; url: string; publisher: string | null; accessed_at: string }>;
};

function client() {
  try {
    const secrets = runtimeSecrets();
    return createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

export async function publishedContent(kind: PublicContentKind, slug: string): Promise<PublicContent | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("content_items")
    .select("id,kind,slug,title,excerpt,body_markdown,seo_title,seo_description,canonical_url,primary_media_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type)),content_sources(sources(title,url,publisher,accessed_at))")
    .eq("kind", kind)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data || !data.published_at) return null;
  const media = ((data.content_media ?? []) as unknown as Array<{ media_assets: PublicMedia[] | null }>).flatMap((entry) => entry.media_assets ?? []);
  const sources = ((data.content_sources ?? []) as unknown as Array<{ sources: Array<{ title: string; url: string; publisher: string | null; accessed_at: string }> | null }>).flatMap((entry) => entry.sources ?? []);
  return { ...data, kind: data.kind as PublicContentKind, media, sources } as PublicContent;
}

export type PublicContentCard = Pick<PublicContent, "id" | "kind" | "slug" | "title" | "excerpt" | "seo_description" | "primary_media_id" | "published_at" | "updated_at" | "media">;

export async function publishedContentList(kind: PublicContentKind, limit = 24): Promise<PublicContentCard[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("content_items")
    .select("id,kind,slug,title,excerpt,seo_description,primary_media_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type))")
    .eq("kind", kind)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.filter((item) => Boolean(item.published_at)).map((item) => ({
    ...item,
    kind: item.kind as PublicContentKind,
    media: ((item.content_media ?? []) as unknown as Array<{ media_assets: PublicMedia[] | null }>).flatMap((entry) => entry.media_assets ?? []),
  })) as PublicContentCard[];
}

export async function allPublishedContent(limit = 200): Promise<PublicContentCard[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("content_items")
    .select("id,kind,slug,title,excerpt,seo_description,primary_media_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type))")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.filter((item) => Boolean(item.published_at)).map((item) => ({
    ...item,
    kind: item.kind as PublicContentKind,
    media: ((item.content_media ?? []) as unknown as Array<{ media_assets: PublicMedia[] | null }>).flatMap((entry) => entry.media_assets ?? []),
  })) as PublicContentCard[];
}

export async function relatedPublishedContent(kind: PublicContentKind, currentId: string, limit = 3): Promise<PublicContentCard[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("content_items")
    .select("id,kind,slug,title,excerpt,seo_description,primary_media_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type))")
    .eq("kind", kind)
    .eq("status", "published")
    .neq("id", currentId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.filter((item) => Boolean(item.published_at)).map((item) => ({
    ...item,
    kind: item.kind as PublicContentKind,
    media: ((item.content_media ?? []) as unknown as Array<{ media_assets: PublicMedia[] | null }>).flatMap((entry) => entry.media_assets ?? []),
  })) as PublicContentCard[];
}

export function mediaForId(content: Pick<PublicContent, "media">, id: string) {
  return content.media.find((media) => media.id === id) ?? null;
}
