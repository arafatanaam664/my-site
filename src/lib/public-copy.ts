export const forbiddenPublicCmsTerms = [
  "قسم رئيسي",
  "قسم فرعي",
  "مصدر خادمي",
  "أداة عملية",
  "كتالوج الأدوات",
  "محتوى Alshafra",
  "مادة عملية من Alshafra",
  "يعمل داخل متصفحك",
  "خدمة خادمية",
] as const;

export function readMoreLabel(kind?: string | null) {
  if (kind === "news") return "اقرأ الخبر";
  if (kind === "guide") return "اقرأ الدليل";
  if (kind === "article") return "اقرأ المقال";
  if (kind === "solution") return "اقرأ الحل";
  if (kind === "faq") return "اقرأ الإجابة";
  if (kind === "tool") return "افتح الأداة";
  return "اقرأ المزيد";
}

export function relatedHeading(kind?: string | null) {
  if (kind === "news") return "أخبار مشابهة عن التقويم والمواعيد";
  if (kind === "guide") return "أدلة تحويل التاريخ والمواعيد";
  if (kind === "article") return "مقالات عن التاريخ الهجري والحساب";
  if (kind === "solution") return "حلول مشابهة لتحويل التاريخ والحساب";
  if (kind === "faq") return "أسئلة شائعة عن التاريخ والحساب";
  if (kind === "tool") return "أدوات حساب وتقويم أخرى";
  return "المزيد عن التاريخ والحساب";
}

export function publicExcerpt(excerpt?: string | null, seo?: string | null) {
  const text = (excerpt || seo || "").trim();
  return text || null;
}

export function defaultPublicDescription(kind?: string | null) {
  if (kind === "news") return "أخبار التاريخ الهجري والميلادي والمواعيد.";
  if (kind === "guide") return "دليل لتحويل التاريخ الهجري وحساب المواعيد خطوة بخطوة.";
  if (kind === "article") return "مقال عن التقويم الهجري والحساب اليومي.";
  if (kind === "solution") return "حل لمسألة تحويل التاريخ أو حساب النسبة والعمر والخصم.";
  if (kind === "faq") return "إجابة عن تحويل التاريخ الهجري أو حاسبة العمر والنسبة.";
  if (kind === "tool") return "حوّل التاريخ الهجري أو احسب العمر والنسبة والخصم.";
  return "تحويل التاريخ الهجري وحاسبة العمر والنسبة والخصم.";
}
