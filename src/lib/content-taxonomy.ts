export const publicContentKinds = ["article", "guide", "solution", "faq", "news", "tool", "page"] as const;
export type PublicContentKind = (typeof publicContentKinds)[number];
export const editorialContentKinds = ["article", "guide", "solution", "faq", "news", "page", "tool"] as const;
export type EditorialContentKind = (typeof editorialContentKinds)[number];

export const publicSectionMap = {
  articles: { kind: "article", title: "مقالات التقويم والتاريخ الهجري", description: "مقالات عربية عن تحويل التاريخ والتقويم الهجري والحساب اليومي.", singular: "مقال", label: "مقال" },
  guides: { kind: "guide", title: "أدلة تحويل التاريخ وحساب المواعيد", description: "كيف تحوّل التاريخ الهجري وتحسب العمر وفرق الأيام خطوة بخطوة.", singular: "دليل", label: "دليل" },
  solutions: { kind: "solution", title: "حلول تحويل التاريخ والحساب", description: "حلول لمسائل تحويل التاريخ الهجري وحساب النسبة والعمر والخصم.", singular: "حل", label: "حل" },
  faqs: { kind: "faq", title: "أسئلة شائعة عن التاريخ والحساب", description: "إجابات عن تحويل التاريخ الهجري والنسبة والخصم وحاسبة العمر.", singular: "سؤال شائع", label: "سؤال شائع" },
  news: { kind: "news", title: "أخبار التقويم والمواعيد", description: "أخبار التاريخ الهجري والميلادي والمواعيد بعد المراجعة.", singular: "خبر", label: "خبر" },
  tools: { kind: "tool", title: "أدوات تحويل التاريخ والحساب", description: "تحويل التاريخ الهجري، حاسبة العمر، النسبة المئوية، الخصم، وفرق الأيام.", singular: "أداة", label: "أداة" },
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
