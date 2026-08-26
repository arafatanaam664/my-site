import { normalizeArabicSearch } from "./arabic-search";

export type ToolCatalogEntry = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: string;
  mode: "client" | "server";
};

export const builtInToolCatalog: ToolCatalogEntry[] = [
  {
    id: "date-difference",
    href: "/tools/date-difference",
    title: "حاسبة فرق الأيام بين تاريخين",
    description: "تحسب الفرق العددي بين تاريخي البداية والنهاية داخل المتصفح، من دون إرسال تاريخي الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
  {
    id: "age-calculator",
    href: "/tools/age-calculator",
    title: "حاسبة العمر بالسنوات والأشهر والأيام",
    description: "تحسب عمرك بين تاريخ الميلاد وتاريخ مرجعي تختاره داخل المتصفح، من دون إرسال التاريخين إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
  {
    id: "date-offset",
    href: "/tools/date-offset",
    title: "حاسبة تاريخ بعد عدد من الأيام",
    description: "تُظهر تاريخًا مستقبليًا أو سابقًا بعد عدد تختاره من الأيام داخل المتصفح، من دون إرسال تاريخ الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
  },
];

export function searchBuiltInTools(query: string) {
  const normalized = normalizeArabicSearch(query);
  if (normalized.length < 2) return [];
  const words = normalized.split(" ").filter(Boolean);
  return builtInToolCatalog
    .map((tool) => {
      const title = normalizeArabicSearch(tool.title);
      const description = normalizeArabicSearch(`${tool.description} ${tool.category}`);
      const titleHits = words.filter((word) => title.includes(word)).length;
      const descriptionHits = words.filter((word) => description.includes(word)).length;
      return { tool, score: titleHits * 3 + descriptionHits };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.tool.title.localeCompare(right.tool.title, "ar"))
    .map((result) => result.tool);
}
