export const publicContentKinds = ["article", "guide", "solution", "faq", "news", "tool", "page"] as const;
export type PublicContentKind = (typeof publicContentKinds)[number];
export const editorialContentKinds = ["article", "guide", "solution", "faq", "news", "page", "tool"] as const;
export type EditorialContentKind = (typeof editorialContentKinds)[number];

export const publicSectionMap = {
  articles: { kind: "article", title: "مقالات عملية موثقة", description: "مقالات عربية منظمة تشرح الموضوع وتعرض مصادره وخطواته بوضوح.", singular: "مقال", label: "مقال" },
  guides: { kind: "guide", title: "أدلة عملية خطوة بخطوة", description: "أدلة تساعدك على تنفيذ المهمة وفهم ما تحتاجه قبل أن تبدأ.", singular: "دليل", label: "دليل" },
  solutions: { kind: "solution", title: "حلول لمسائل متكررة", description: "صفحات حلول عملية تبدأ من مشكلة واضحة وتصل إلى خطوة يمكن تنفيذها.", singular: "حل", label: "حل" },
  faqs: { kind: "faq", title: "أسئلة شائعة", description: "إجابات موجزة لأسئلة متكررة، مع إحالة إلى الدليل أو الأداة عند الحاجة.", singular: "سؤال شائع", label: "سؤال شائع" },
  news: { kind: "news", title: "أخبار موثقة", description: "أخبار قصيرة ذات مصدر واضح، تُنشر فقط عند وجود مادة مراجعة.", singular: "خبر", label: "خبر" },
  tools: { kind: "tool", title: "أدوات Alshafra العملية", description: "صفحات أدوات وشروحات تساعدك على الوصول إلى نتيجة قابلة للاستخدام.", singular: "أداة", label: "أداة" },
} as const;

export type PublicSection = keyof typeof publicSectionMap;

export function isPublicSection(value: string): value is PublicSection {
  return value in publicSectionMap;
}

export function isEditorialContentKind(value: unknown): value is EditorialContentKind {
  return typeof value === "string" && (editorialContentKinds as readonly string[]).includes(value);
}

export function sectionForKind(kind: string) {
  const entry = Object.entries(publicSectionMap).find(([, value]) => value.kind === kind);
  return entry?.[0] ?? null;
}

export function labelForKind(kind: string) {
  const entry = Object.values(publicSectionMap).find((value) => value.kind === kind);
  return entry?.label ?? "مادة";
}

export const sourcedContentKinds = ["article", "guide", "solution", "faq", "news"] as const;
