import type { PublicContentCard } from "./server/public-content";

const diacritics = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

const synonymGroups = [
  ["واتساب", "واتس", "واتس اب", "واتسآب", "whatsapp"],
  ["هجري", "هجريه"],
  ["ام القرى", "ام القري", "أم القرى"],
  ["ميلادي", "جريجوري"],
  ["نسبة", "نسبه مئوية", "percent"],
  ["خصم", "تخفيض", "discount"],
  ["عمر", "السن"],
  ["bmi", "كتلة الجسم", "كتله الجسم"],
  ["عداد", "تنازلي"],
];

export function normalizeArabicSearch(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(diacritics, "")
    .replace(/ـ/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

export function expandSearchTokens(query: string) {
  const normalized = normalizeArabicSearch(query);
  const words = normalized.split(" ").filter(Boolean);
  const extra: string[] = [];
  for (const group of synonymGroups) {
    const normalizedGroup = group.map(normalizeArabicSearch);
    if (normalizedGroup.some((term) => term.length >= 2 && (normalized.includes(term) || words.includes(term)))) extra.push(...normalizedGroup);
  }
  return [...new Set([...words, ...extra])];
}

export function searchPublicContent(items: PublicContentCard[], query: string) {
  const normalized = normalizeArabicSearch(query);
  if (normalized.length < 2) return [];
  const words = expandSearchTokens(query).filter((word) => word.length >= 2);
  return items
    .map((item) => {
      const title = normalizeArabicSearch(item.title);
      const body = normalizeArabicSearch([item.excerpt, item.seo_description].filter(Boolean).join(" "));
      const titleHits = words.filter((word) => title.includes(word)).length;
      const bodyHits = words.filter((word) => body.includes(word)).length;
      return { item, score: titleHits * 3 + bodyHits };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.item.published_at.localeCompare(a.item.published_at))
    .map((result) => result.item);
}
