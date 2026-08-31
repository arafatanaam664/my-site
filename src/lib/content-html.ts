const allowedTags = new Set(["p", "h2", "h3", "h4", "h5", "ul", "ol", "li", "blockquote", "pre", "code", "strong", "b", "em", "i", "u", "s", "sub", "sup", "span", "a", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr", "br", "div"]);
const voidTags = new Set(["br", "hr", "img"]);
const allowedAttributes: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  figure: new Set(["data-media-id"]),
  span: new Set(["style"]),
  p: new Set(["style", "dir"]),
  h2: new Set(["dir"]),
  h3: new Set(["dir"]),
  h4: new Set(["dir"]),
  div: new Set(["dir", "style"]),
};
const colorPattern = /^(#([0-9a-f]{3}|[0-9a-f]{6})|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\))$/i;

export function looksLikeHtml(value: string | null | undefined) {
  return Boolean(value && /<\/?(p|h[2-5]|ul|ol|li|table|blockquote|figure|div|span|strong|em|a)\b/i.test(value));
}

export function htmlToPlainText(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\{\{media:[0-9a-f-]{36}\}\}/gi, " ").replace(/\s+/g, " ").trim();
}

export function extractHeadings(html: string) {
  return [...html.matchAll(/<h([2-4])[^>]*>(.*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]) as 2 | 3 | 4,
    text: htmlToPlainText(match[2]),
  })).filter((entry) => entry.text);
}

function escapeText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeStyle(value: string) {
  const allowed: string[] = [];
  for (const part of value.split(";")) {
    const [rawName, ...rest] = part.split(":");
    const name = rawName?.trim().toLowerCase();
    const raw = rest.join(":").trim();
    if ((name === "color" || name === "background-color") && colorPattern.test(raw)) allowed.push(`${name}: ${raw}`);
    if (name === "text-align" && /^(right|left|center|justify)$/i.test(raw)) allowed.push(`${name}: ${raw.toLowerCase()}`);
    if (name === "font-size" && /^\d{1,3}(px|rem|em)$/i.test(raw)) allowed.push(`${name}: ${raw}`);
  }
  return allowed.join("; ");
}

function sanitizeUrl(value: string, kind: "href" | "src") {
  const trimmed = value.trim();
  if (kind === "src") {
    if (/^\/media\/[0-9a-f-]{36}(?:\?preset=[a-z]+)?$/i.test(trimmed)) return trimmed;
    if (/^https:\/\/alshafra\.com\//i.test(trimmed)) return trimmed;
    return "";
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^https:\/\//i.test(trimmed) || /^mailto:[^@\s]+@[^@\s]+$/i.test(trimmed)) return trimmed;
  return "";
}

function sanitizeAttributes(tag: string, raw: string) {
  const allowed = new Set([...(allowedAttributes[tag] ?? []), "dir"]);
  const pairs: string[] = [];
  const pattern = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of raw.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (name.startsWith("on") || name === "srcset" || !allowed.has(name)) continue;
    let next = value.trim();
    if (name === "href") next = sanitizeUrl(next, "href");
    if (name === "src") next = sanitizeUrl(next, "src");
    if (name === "style") next = sanitizeStyle(next);
    if (name === "target" && next !== "_blank") continue;
    if (name === "rel") next = "noopener noreferrer";
    if (name === "dir" && !["rtl", "ltr"].includes(next.toLowerCase())) continue;
    if (name === "data-media-id" && !/^[0-9a-f-]{36}$/i.test(next)) continue;
    if (!next) continue;
    pairs.push(`${name}="${escapeText(next)}"`);
  }
  if (tag === "a" && pairs.some((entry) => entry.startsWith("href=")) && !pairs.some((entry) => entry.startsWith("rel="))) pairs.push('rel="noopener noreferrer"');
  return pairs.join(" ");
}

export function sanitizeContentHtml(input: string | null | undefined) {
  if (!input) return "";
  const source = input.replace(/\u0000/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  let output = "";
  const stack: string[] = [];
  const pattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)/g;
  for (const match of source.matchAll(pattern)) {
    if (match[3]) { output += escapeText(match[3]); continue; }
    const tag = match[1].toLowerCase();
    const raw = match[2] ?? "";
    const closing = match[0].startsWith("</");
    const selfClosing = voidTags.has(tag) || /\/\s*$/.test(raw);
    if (!allowedTags.has(tag)) continue;
    if (closing) {
      const index = stack.lastIndexOf(tag);
      if (index === -1) continue;
      while (stack.length > index) {
        const open = stack.pop();
        if (open) output += `</${open}>`;
      }
      continue;
    }
    const attributes = sanitizeAttributes(tag, raw);
    output += attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
    if (!selfClosing) stack.push(tag);
    else if (!voidTags.has(tag)) output += `</${tag}>`;
  }
  while (stack.length) output += `</${stack.pop()}>`;
  return output.trim();
}

export function markdownToEditorHtml(markdown: string | null | undefined) {
  if (!markdown?.trim()) return "<p></p>";
  if (looksLikeHtml(markdown)) return sanitizeContentHtml(markdown) || "<p></p>";
  const blocks: string[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push(`<p>${escapeText(text)}</p>`);
    paragraph = [];
  };
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const media = line.match(/^\s*\{\{media:([0-9a-f-]{36})\}\}\s*$/i);
    if (media) {
      flush();
      const id = media[1].toLowerCase();
      blocks.push(`<figure data-media-id="${id}"><img src="/media/${id}?preset=standard" alt="" /><figcaption></figcaption></figure>`);
      continue;
    }
    if (line.startsWith("### ")) { flush(); blocks.push(`<h3>${escapeText(line.slice(4).trim())}</h3>`); continue; }
    if (line.startsWith("## ")) { flush(); blocks.push(`<h2>${escapeText(line.slice(3).trim())}</h2>`); continue; }
    if (!line.trim()) { flush(); continue; }
    paragraph.push(line.trim());
  }
  flush();
  return blocks.join("") || "<p></p>";
}
