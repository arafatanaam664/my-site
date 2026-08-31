import { editorialContentKinds, type EditorialContentKind } from "./content-taxonomy";

export const reservedSectionSlugs = [
  "admin", "api", "articles", "calendar", "community", "contact", "faqs", "gone", "guides", "index",
  "legal", "media", "news", "search", "sitemap", "solutions", "tools",
] as const;

export const defaultSectionIds = {
  calendar: "a1c4e000-0000-4000-8000-000000000001",
  calendarNews: "a1c4e000-0000-4000-8000-000000000101",
  calendarGuides: "a1c4e000-0000-4000-8000-000000000102",
  calendarTools: "a1c4e000-0000-4000-8000-000000000103",
  calendarSolutions: "a1c4e000-0000-4000-8000-000000000104",
  calendarArticles: "a1c4e000-0000-4000-8000-000000000105",
  community: "a1c4e000-0000-4000-8000-000000000002",
} as const;

export type SiteSectionRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  parentId: string | null;
  contentKind: EditorialContentKind | null;
  navOrder: number;
  enabled: boolean;
  publicVisible: boolean;
  systemKey: string | null;
  destinationPath: string | null;
};

export type SiteSectionNode = SiteSectionRecord & {
  href: string;
  children: SiteSectionNode[];
};

export function isEditorialKind(value: unknown): value is EditorialContentKind {
  return typeof value === "string" && (editorialContentKinds as readonly string[]).includes(value);
}

export function isReservedSectionSlug(slug: string) {
  return (reservedSectionSlugs as readonly string[]).includes(slug);
}

export function isSectionSlug(value: string) {
  return /^[a-z][a-z0-9-]{1,47}$/.test(value);
}

export function defaultSiteSections(): SiteSectionRecord[] {
  return [
    { id: defaultSectionIds.calendar, slug: "calendar", title: "التقويم والمواعيد", description: "التاريخ والتحويل والمحتوى المرتبط بالمواعيد: أخبار، أدلة، أدوات، حلول، ومقالات.", parentId: null, contentKind: null, navOrder: 10, enabled: true, publicVisible: true, systemKey: "calendar", destinationPath: "/calendar" },
    { id: defaultSectionIds.calendarNews, slug: "news", title: "الأخبار", description: "أخبار قصيرة موثقة تُنشر بعد المراجعة التحريرية.", parentId: defaultSectionIds.calendar, contentKind: "news", navOrder: 11, enabled: true, publicVisible: true, systemKey: "calendar-news", destinationPath: null },
    { id: defaultSectionIds.calendarGuides, slug: "guides", title: "الأدلة", description: "أدلة عملية خطوة بخطوة لتنفيذ مهمة واضحة.", parentId: defaultSectionIds.calendar, contentKind: "guide", navOrder: 12, enabled: true, publicVisible: true, systemKey: "calendar-guides", destinationPath: null },
    { id: defaultSectionIds.calendarTools, slug: "tools", title: "الأدوات", description: "أدوات حساب وتحويل تعمل داخل المتصفح أو عبر مصدر خادمي معلن.", parentId: defaultSectionIds.calendar, contentKind: "tool", navOrder: 13, enabled: true, publicVisible: true, systemKey: "calendar-tools", destinationPath: null },
    { id: defaultSectionIds.calendarSolutions, slug: "solutions", title: "الحلول", description: "حلول لمسائل متكررة تبدأ من مشكلة واضحة.", parentId: defaultSectionIds.calendar, contentKind: "solution", navOrder: 14, enabled: true, publicVisible: true, systemKey: "calendar-solutions", destinationPath: null },
    { id: defaultSectionIds.calendarArticles, slug: "articles", title: "المقالات", description: "مقالات عربية منظمة تشرح الموضوع وتعرض مصادره.", parentId: defaultSectionIds.calendar, contentKind: "article", navOrder: 15, enabled: true, publicVisible: true, systemKey: "calendar-articles", destinationPath: null },
    { id: defaultSectionIds.community, slug: "community", title: "المجتمع", description: "أسئلة ونقاش يُفتح للعامة فقط بعد تفعيله من لوحة التحكم.", parentId: null, contentKind: null, navOrder: 80, enabled: false, publicVisible: true, systemKey: "community", destinationPath: "/community" },
  ];
}

export function sectionHref(section: Pick<SiteSectionRecord, "slug" | "parentId" | "destinationPath">, byId: Map<string, SiteSectionRecord>) {
  if (section.destinationPath) return section.destinationPath;
  if (!section.parentId) return `/${section.slug}`;
  const parent = byId.get(section.parentId);
  return parent ? `/${parent.slug}/${section.slug}` : `/${section.slug}`;
}

export function buildSectionTree(records: SiteSectionRecord[]): SiteSectionNode[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  const nodes = new Map<string, SiteSectionNode>();
  for (const record of records) nodes.set(record.id, { ...record, href: sectionHref(record, byId), children: [] });
  const roots: SiteSectionNode[] = [];
  for (const node of [...nodes.values()].sort((left, right) => left.navOrder - right.navOrder || left.title.localeCompare(right.title, "ar"))) {
    if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function findSectionBySlugPath(records: SiteSectionRecord[], hubSlug: string, childSlug?: string) {
  const tree = buildSectionTree(records);
  const hub = tree.find((node) => node.slug === hubSlug) ?? null;
  if (!childSlug) return { hub, child: null };
  return { hub, child: hub?.children.find((node) => node.slug === childSlug) ?? null };
}

export function contentPath(kind: string, slug: string, hubSlug?: string | null, childSlug?: string | null) {
  if (hubSlug && childSlug) return `/${hubSlug}/${childSlug}/${slug}`;
  if (kind === "article") return `/articles/${slug}`;
  if (kind === "guide") return `/guides/${slug}`;
  if (kind === "solution") return `/solutions/${slug}`;
  if (kind === "faq") return `/faqs/${slug}`;
  if (kind === "news") return `/news/${slug}`;
  if (kind === "tool") return `/tools/${slug}`;
  return `/${slug}`;
}

export function subsectionFeature(kind: EditorialContentKind | null, systemKey: string | null): "content_core" | "tools_core" | "community" | null {
  if (systemKey === "community") return "community";
  if (kind === "tool") return "tools_core";
  if (kind === "article" || kind === "guide" || kind === "solution" || kind === "faq" || kind === "news") return "content_core";
  return null;
}
