import { findEditorialItem, findTool } from "@/content/catalog";

export type HeadMeta = { title: string; description: string; canonicalPath?: string; noindex?: boolean; notFound?: boolean; ogType?: "website" | "article"; schema?: "website" | "article" };

const SITE = "Alshafra";
const DEFAULT_DESCRIPTION = "منصة عربية مستقلة للأدوات العملية والمواعيد والأدلة الواضحة.";
const staticPages: Record<string, Omit<HeadMeta, "canonicalPath">> = {
  "/": { title: "Alshafra | أدوات ومعلومات عملية بالعربية", description: "منصة عربية مستقلة للأدوات العملية والمواعيد والأدلة الواضحة.", schema: "website" },
  "/tools": { title: "أدوات عملية للحساب والتاريخ | Alshafra", description: "استخدم أدوات عملية للحساب وتحويل التاريخ وفهم النتائج بخطوات واضحة." },
  "/calendar": { title: "التقويم والمواعيد: مصادر وحالات واضحة | Alshafra", description: "قسم للمواعيد والتقويم يوضح المصدر والحالة ووقت المراجعة عند الحاجة." },
  "/guides": { title: "أدلة عملية تشرح الخطوة التالية | Alshafra", description: "أدلة عربية أصلية تساعدك على فهم الأدوات والمواعيد والمعلومات العملية في سياقها." },
  "/articles": { title: "مقالات عملية بالعربية | Alshafra", description: "مقالات موجزة لفهم الحسابات والمواعيد والمعلومات العملية بوضوح." },
  "/about": { title: "عن منصة Alshafra", description: "تعرف على مبادئ منصة Alshafra المستقلة للأدوات والمواعيد والأدلة." },
  "/privacy": { title: "سياسة الخصوصية | Alshafra", description: "مبادئ الخصوصية والقياس في منصة Alshafra." },
  "/terms": { title: "شروط الاستخدام | Alshafra", description: "شروط استخدام الأدوات والمحتوى في منصة Alshafra." },
  "/contact": { title: "تواصل مع Alshafra", description: "قنوات التواصل ومبادئ الإبلاغ عن ملاحظات المحتوى في Alshafra." },
};

export function prefetchForPath(rawUrl: string): HeadMeta {
  let path = rawUrl.split("?")[0];
  try { path = decodeURI(path); } catch { /* use raw path */ }
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/search") return { title: "البحث في Alshafra", description: "ابحث في الأدوات والأدلة والمقالات المنشورة في Alshafra.", canonicalPath: clean, noindex: true };
  const tool = clean.match(/^\/tools\/([^/]+)$/);
  if (tool) {
    const item = findTool(tool[1]);
    if (!item) return { title: SITE, description: DEFAULT_DESCRIPTION, notFound: true };
    return { title: `${item.title} | Alshafra`, description: item.summary, canonicalPath: clean };
  }
  const editorial = clean.match(/^\/(guides|articles)\/([^/]+)$/);
  if (editorial) {
    const item = findEditorialItem(editorial[2]);
    if (!item || (editorial[1] === "guides" ? item.type !== "guide" : item.type !== "article")) return { title: SITE, description: DEFAULT_DESCRIPTION, notFound: true };
    return { title: `${item.title} | Alshafra`, description: item.excerpt, canonicalPath: clean, ogType: "article", schema: "article" };
  }
  const page = staticPages[clean];
  return page ? { ...page, canonicalPath: clean } : { title: SITE, description: DEFAULT_DESCRIPTION, notFound: true };
}
