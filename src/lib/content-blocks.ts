export type ContentBlock = { type: "heading" | "paragraph" | "media"; level?: 2 | 3; text?: string; mediaId?: string };

const mediaLine = /^\s*\{\{media:([0-9a-f-]{36})\}\}\s*$/i;

export function contentBlocks(markdown: string | null): ContentBlock[] {
  if (!markdown?.trim()) return [];
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const media = line.match(mediaLine);
    if (media) { flushParagraph(); blocks.push({ type: "media", mediaId: media[1].toLowerCase() }); continue; }
    if (line.startsWith("### ")) { flushParagraph(); blocks.push({ type: "heading", level: 3, text: line.slice(4).trim() }); continue; }
    if (line.startsWith("## ")) { flushParagraph(); blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() }); continue; }
    if (!line.trim()) { flushParagraph(); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph();
  return blocks;
}
