export const platformFeatureDefinitions = [
  { flag: "content_core", label: "المحتوى العام", defaultEnabled: true, publicVisible: true },
  { flag: "tools_core", label: "الأدوات العامة", defaultEnabled: true, publicVisible: true },
  { flag: "community", label: "المجتمع والأسئلة", defaultEnabled: false, publicVisible: true },
  { flag: "member_accounts", label: "حسابات الأعضاء", defaultEnabled: false, publicVisible: false },
  { flag: "comments", label: "التعليقات", defaultEnabled: false, publicVisible: false },
  { flag: "opportunities", label: "الفرص والمنح", defaultEnabled: false, publicVisible: false },
  { flag: "social_sharing", label: "مشاركة المحتوى", defaultEnabled: true, publicVisible: true },
  { flag: "social_publishing", label: "النشر الاجتماعي", defaultEnabled: false, publicVisible: false },
  { flag: "automation", label: "الأتمتة", defaultEnabled: false, publicVisible: false },
  { flag: "scheduled_publishing", label: "النشر المجدول", defaultEnabled: false, publicVisible: false },
  { flag: "ai_features", label: "ميزات الذكاء الاصطناعي", defaultEnabled: false, publicVisible: false },
] as const;

export type PlatformFeatureFlag = (typeof platformFeatureDefinitions)[number]["flag"];

export function featureForPublicSection(section: string): PlatformFeatureFlag | null {
  if (section === "articles" || section === "guides" || section === "solutions" || section === "faqs" || section === "news") return "content_core";
  if (section === "tools") return "tools_core";
  if (section === "community") return "community";
  return null;
}

export function isPlatformFeatureFlag(value: unknown): value is PlatformFeatureFlag {
  return typeof value === "string" && platformFeatureDefinitions.some((definition) => definition.flag === value);
}

export function publicFeatureSnapshot(rows: Array<{ flag: string; enabled: boolean; public_visible: boolean }>) {
  return rows.filter((row) => row.public_visible).map((row) => ({ flag: row.flag, enabled: row.enabled }));
}
