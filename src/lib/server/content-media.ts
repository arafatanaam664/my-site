const tokenPattern = /\{\{media:([0-9a-f-]{36})\}\}/gi;
const attributePattern = /data-media-id=["']([0-9a-f-]{36})["']/gi;
const srcPattern = /\/media\/([0-9a-f-]{36})/gi;

export function inlineMediaReferences(markdown: string | null) {
  const references: Array<{ mediaId: string; position: number }> = [];
  const seen = new Set<string>();
  if (!markdown) return references;
  for (const pattern of [tokenPattern, attributePattern, srcPattern]) {
    pattern.lastIndex = 0;
    for (const match of markdown.matchAll(pattern)) {
      const mediaId = match[1].toLowerCase();
      if (seen.has(mediaId)) continue;
      seen.add(mediaId);
      references.push({ mediaId, position: match.index ?? 0 });
    }
  }
  return references;
}

export function mediaToken(mediaId: string) {
  return `{{media:${mediaId}}}`;
}
