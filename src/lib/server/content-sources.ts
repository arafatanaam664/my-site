export const sourceKinds = ["official", "primary", "secondary"] as const;
export type SourceKind = (typeof sourceKinds)[number];
export type SourceInput = { title: string; url: string; kind: SourceKind; publisher: string | null; publishedAt: string | null; note: string | null };

export function parseSources(value: unknown): SourceInput[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const parsed: SourceInput[] = [];
  const seenUrls = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const source = item as Record<string, unknown>;
    const title = typeof source.title === "string" ? source.title.trim() : "";
    const url = typeof source.url === "string" ? source.url.trim() : "";
    const kind = source.kind;
    const publisher = typeof source.publisher === "string" && source.publisher.trim() ? source.publisher.trim().slice(0, 160) : null;
    const publishedAt = typeof source.publishedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source.publishedAt) ? source.publishedAt : null;
    const note = typeof source.note === "string" && source.note.trim() ? source.note.trim().slice(0, 500) : null;
    if (title.length < 5 || title.length > 240 || !(sourceKinds as readonly string[]).includes(kind as string)) return null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "https:" || seenUrls.has(parsedUrl.href)) return null;
      seenUrls.add(parsedUrl.href);
      parsed.push({ title, url: parsedUrl.href, kind: kind as SourceKind, publisher, publishedAt, note });
    } catch { return null; }
  }
  return parsed;
}
