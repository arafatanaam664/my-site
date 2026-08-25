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

export function canAccessEditorialContent(role: AdminIdentity["role"], actorId: string, ownerId: string | null) {
  return role === "admin" || role === "editor" || ownerId === actorId;
}

export function isContentStatus(value: unknown): value is ContentStatus {
  return typeof value === "string" && (contentStatuses as readonly string[]).includes(value);
}
