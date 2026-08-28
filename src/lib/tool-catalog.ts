import { expandSearchTokens, normalizeArabicSearch } from "./arabic-search";

export type ToolCatalogEntry = {
  id: string;
  href: string;
  title: string;
  description: string;
  category: string;
  mode: "client" | "server";
  keywords: string[];
};

export const builtInToolCatalog: ToolCatalogEntry[] = [
  {
    id: "hijri-converter",
    href: "/tools/hijri-converter",
    title: "تحويل التاريخ الهجري إلى الميلادي",
    description: "حوّل بين التاريخ الهجري والمدني الميلادي داخل المتصفح، مع توضيح أن النتيجة حسابية جدولية وليست إعلان أم القرى الرسمي.",
    category: "التاريخ والتقويم",
    mode: "client",
    keywords: ["هجري", "ميلادي", "تحويل التاريخ", "ام القرى", "تقويم"],
  },
  {
    id: "date-difference",
    href: "/tools/date-difference",
    title: "حاسبة فرق الأيام بين تاريخين",
    description: "تحسب الفرق العددي بين تاريخي البداية والنهاية داخل المتصفح، من دون إرسال تاريخي الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
    keywords: ["فرق الايام", "بين تاريخين"],
  },
  {
    id: "age-calculator",
    href: "/tools/age-calculator",
    title: "حاسبة العمر بالسنوات والأشهر والأيام",
    description: "تحسب عمرك بين تاريخ الميلاد وتاريخ مرجعي تختاره داخل المتصفح، من دون إرسال التاريخين إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
    keywords: ["العمر", "السن", "ميلاد"],
  },
  {
    id: "date-offset",
    href: "/tools/date-offset",
    title: "حاسبة تاريخ بعد عدد من الأيام",
    description: "تُظهر تاريخًا مستقبليًا أو سابقًا بعد عدد تختاره من الأيام داخل المتصفح، من دون إرسال تاريخ الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
    keywords: ["بعد ايام", "قبل ايام"],
  },
  {
    id: "weekday-calculator",
    href: "/tools/weekday-calculator",
    title: "معرفة يوم الأسبوع من التاريخ الميلادي",
    description: "تحدد يوم الأسبوع لتاريخ ميلادي صحيح داخل المتصفح، من دون إرسال تاريخ الإدخال إلى الخادم.",
    category: "التاريخ والحساب",
    mode: "client",
    keywords: ["يوم الاسبوع", "الاحد", "الخميس"],
  },
  {
    id: "percentage",
    href: "/tools/percentage",
    title: "حاسبة النسبة المئوية",
    description: "احسب قيمة النسبة، أو النسبة من رقمين، أو نسبة التغير، داخل المتصفح دون إرسال الأرقام إلى الخادم.",
    category: "الحساب اليومي",
    mode: "client",
    keywords: ["نسبه", "مئوية", "percent"],
  },
  {
    id: "discount",
    href: "/tools/discount",
    title: "حاسبة الخصم والسعر النهائي",
    description: "أدخل السعر ونسبة الخصم لمعرفة التوفير والسعر بعد التخفيض داخل المتصفح.",
    category: "الحساب اليومي",
    mode: "client",
    keywords: ["خصم", "تخفيض", "سعر"],
  },
  {
    id: "countdown",
    href: "/tools/countdown",
    title: "عدّاد تنازلي لتاريخ مستهدف",
    description: "اعرض الزمن المتبقي حتى تاريخ ووقت تختارهما، بالأيام والساعات والدقائق والثواني داخل المتصفح.",
    category: "التاريخ والحساب",
    mode: "client",
    keywords: ["عداد", "تنازلي", "متبقي"],
  },
  {
    id: "bmi",
    href: "/tools/bmi",
    title: "حاسبة مؤشر كتلة الجسم",
    description: "احسب مؤشر كتلة الجسم من الوزن والطول وفق تصنيف منظمة الصحة العالمية، داخل المتصفح.",
    category: "الحساب اليومي",
    mode: "client",
    keywords: ["bmi", "كتلة الجسم", "وزن", "طول"],
  },
];

export function relatedTools(currentId: string, limit = 3) {
  const current = builtInToolCatalog.find((tool) => tool.id === currentId);
  const rest = builtInToolCatalog.filter((tool) => tool.id !== currentId);
  const same = rest.filter((tool) => tool.category === current?.category);
  const other = rest.filter((tool) => tool.category !== current?.category);
  return [...same, ...other].slice(0, limit);
}

export function searchBuiltInTools(query: string) {
  if (normalizeArabicSearch(query).length < 2) return [];
  const tokens = expandSearchTokens(query).filter((token) => token.length >= 2);
  return builtInToolCatalog
    .map((tool) => {
      const title = normalizeArabicSearch(tool.title);
      const description = normalizeArabicSearch(`${tool.description} ${tool.category} ${tool.keywords.join(" ")}`);
      const titleHits = tokens.filter((word) => word.length >= 2 && title.includes(word)).length;
      const descriptionHits = tokens.filter((word) => word.length >= 2 && description.includes(word)).length;
      return { tool, score: titleHits * 3 + descriptionHits };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.tool.title.localeCompare(right.tool.title, "ar"))
    .map((result) => result.tool);
}
