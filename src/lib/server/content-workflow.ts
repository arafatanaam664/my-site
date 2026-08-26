import type { AdminIdentity } from "./admin";

export const contentStatuses = ["draft", "in_review", "approved", "published", "archived"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export function canTransitionContent(role: AdminIdentity["role"], from: ContentStatus, to: ContentStatus) {
  if (from === to) return to === "draft" && ["admin", "editor", "author"].includes(role);
  if (from === "draft" && to === "in_review") return ["admin", "editor", "author"].includes(role);
  if (from === "in_review" && to === "approved") return ["admin", "editor"].includes(role);
  if (from === "approved" && to === "published") return ["admin", "editor"].includes(role);
  if (from === "published" && to === "archived") return ["admin", "editor"].includes(role);
  return false;
}

export function canAccessEditorialContent(role: AdminIdentity["role"], actorId: string | null, ownerId: string | null) {
  return role === "admin" || role === "editor" || ownerId === actorId;
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === "string" && (contentStatuses as readonly string[]).includes(value);
}

type PublicationCandidate = { kind: string; title: string; body: string | null; seoDescription: string | null; primaryMedia: { width: number; height: number } | null; sourceCount: number };

export function publicationReadiness(candidate: PublicationCandidate) {
  const issues: string[] = [];
  if (candidate.title.trim().length < 15) issues.push("العنوان يحتاج إلى صياغة أوضح");
  if (!candidate.body || candidate.body.trim().length < 300) issues.push("النص المنشور غير كافٍ");
  if (!candidate.seoDescription || candidate.seoDescription.trim().length < 70) issues.push("أضف وصفًا واضحًا لنتائج البحث");
  if (!candidate.primaryMedia) issues.push("أضف صورة رئيسية");
  else if (candidate.primaryMedia.width < 1200 || candidate.primaryMedia.width * candidate.primaryMedia.height < 300_000) issues.push("الصورة الرئيسية تحتاج إلى عرض 1200px ومساحة 300 ألف بكسل على الأقل");
  if (["article", "guide"].includes(candidate.kind) && candidate.sourceCount < 1) issues.push("أضف مصدرًا موثقًا واحدًا على الأقل");
  return issues;
}
