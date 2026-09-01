import { adminClient } from "./admin";
import { withDeadline } from "./deadline";

import type { PublicContentKind as TaxonomyKind } from "../content-taxonomy";
import type { MediaPreset } from "./media-preset";

export type PublicContentKind = TaxonomyKind;
export type PublicMedia = { id: string; alt_text: string; width: number; height: number; mime_type: string };
export type PublicContent = {
  id: string;
  kind: PublicContentKind;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string | null;
  body_html: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  primary_media_id: string | null;
  hub_id: string | null;
  section_id: string | null;
  published_at: string;
  updated_at: string;
  media: PublicMedia[];
  sources: Array<{ title: string; url: string; publisher: string | null; accessed_at: string }>;
};

const cardSelect = "id,kind,slug,title,excerpt,seo_description,primary_media_id,hub_id,section_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type))";

function client() {
  try {
    return adminClient();
  } catch {
    return null;
  }
}

function mapMedia(value: unknown): PublicMedia[] {
  return ((value ?? []) as Array<{ media_assets: PublicMedia[] | null }>).flatMap((entry) => entry.media_assets ?? []);
}

function mapCards(data: Array<Record<string, unknown>>): PublicContentCard[] {
  return data.filter((item) => Boolean(item.published_at)).map((item) => ({
    id: String(item.id),
    kind: item.kind as PublicContentKind,
    slug: String(item.slug),
    title: String(item.title),
    excerpt: typeof item.excerpt === "string" ? item.excerpt : null,
    seo_description: typeof item.seo_description === "string" ? item.seo_description : null,
    primary_media_id: typeof item.primary_media_id === "string" ? item.primary_media_id : null,
    hub_id: typeof item.hub_id === "string" ? item.hub_id : null,
    section_id: typeof item.section_id === "string" ? item.section_id : null,
    published_at: String(item.published_at),
    updated_at: String(item.updated_at),
    media: mapMedia(item.content_media),
  }));
}

export async function publishedContent(kind: PublicContentKind, slug: string): Promise<PublicContent | null> {
  return withDeadline(async () => {
    const supabase = client();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("content_items")
      .select("id,kind,slug,title,excerpt,body_markdown,body_html,seo_title,seo_description,canonical_url,primary_media_id,hub_id,section_id,published_at,updated_at,content_media(media_assets(id,alt_text,width,height,mime_type)),content_sources(sources(title,url,publisher,accessed_at))")
      .eq("kind", kind)
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data || !data.published_at) return null;
    const media = mapMedia(data.content_media);
    const sources = ((data.content_sources ?? []) as unknown as Array<{ sources: Array<{ title: string; url: string; publisher: string | null; accessed_at: string }> | null }>).flatMap((entry) => entry.sources ?? []);
    return { ...data, kind: data.kind as PublicContentKind, body_html: (data as { body_html?: string | null }).body_html ?? null, hub_id: (data as { hub_id?: string | null }).hub_id ?? null, section_id: (data as { section_id?: string | null }).section_id ?? null, media, sources } as PublicContent;
  }, null);
}

export type PublicContentCard = Pick<PublicContent, "id" | "kind" | "slug" | "title" | "excerpt" | "seo_description" | "primary_media_id" | "hub_id" | "section_id" | "published_at" | "updated_at" | "media">;

export async function publishedContentList(kind: PublicContentKind, limit = 24): Promise<PublicContentCard[]> {
  return withDeadline(async () => {
    const supabase = client();
    if (!supabase) return [];
    const { data, error } = await supabase.from("content_items").select(cardSelect).eq("kind", kind).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
    if (error || !data) return [];
    return mapCards(data as Array<Record<string, unknown>>);
  }, []);
}

export async function publishedContentForSection(sectionId: string, limit = 6): Promise<PublicContentCard[]> {
  return withDeadline(async () => {
    const supabase = client();
    if (!supabase) return [];
    const { data, error } = await supabase.from("content_items").select(cardSelect).eq("section_id", sectionId).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
    if (error || !data) return [];
    return mapCards(data as Array<Record<string, unknown>>);
  }, []);
}

export async function allPublishedContent(limit = 200): Promise<PublicContentCard[]> {
  return withDeadline(async () => {
    const supabase = client();
    if (!supabase) return [];
    const { data, error } = await supabase.from("content_items").select(cardSelect).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
    if (error || !data) return [];
    return mapCards(data as Array<Record<string, unknown>>);
  }, []);
}

export async function relatedPublishedContent(kind: PublicContentKind, currentId: string, limit = 3): Promise<PublicContentCard[]> {
  return withDeadline(async () => {
    const supabase = client();
    if (!supabase) return [];
    const { data, error } = await supabase.from("content_items").select(cardSelect).eq("kind", kind).eq("status", "published").neq("id", currentId).order("published_at", { ascending: false }).limit(limit);
    if (error || !data) return [];
    return mapCards(data as Array<Record<string, unknown>>);
  }, []);
}

export function mediaForId(content: Pick<PublicContent, "media">, id: string) {
  return content.media.find((media) => media.id === id) ?? null;
}

export function mediaSrc(id: string, preset: MediaPreset = "standard") {
  return `/media/${id}?preset=${preset}`;
}

export function mediaAbsoluteSrc(id: string, preset: MediaPreset = "hero", origin = "https://alshafra.com") {
  return `${origin}/media/${id}?preset=${preset}`;
}
