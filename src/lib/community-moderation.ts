export const moderationTransitionMap = {
  question: { publish: "published", hide: "hidden", lock: "locked", archive: "archived", restore: "pending" },
  answer: { publish: "published", hide: "hidden", restore: "pending" },
  member: { suspend: true, restore: false },
  report: { resolve_report: "resolved", dismiss_report: "dismissed" },
} as const;

export type ModerationTargetType = keyof typeof moderationTransitionMap;

export function moderationActionAllowed(targetType: string, action: string): targetType is ModerationTargetType {
  return targetType in moderationTransitionMap && action in moderationTransitionMap[targetType as ModerationTargetType];
}

export function moderationTargetIdValid(targetType: string, targetId: unknown) {
  if (typeof targetId !== "string") return false;
  if (targetType === "report") return /^\d+$/.test(targetId);
  return /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(targetId);
}
