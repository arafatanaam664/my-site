export const communityStatuses = ["pending", "published", "locked", "archived", "hidden"] as const;
export const moderationActions = ["publish", "hide", "lock", "archive", "suspend", "restore", "resolve_report", "dismiss_report"] as const;

export function communityPublicStatus(status: string) {
  return status === "published";
}
