export type SiteNotice = { enabled: boolean; message: string };

export const defaultSiteNotice: SiteNotice = { enabled: false, message: "" };

export function parseSiteNotice(value: unknown): SiteNotice | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { enabled?: unknown; message?: unknown };
  if (typeof candidate.enabled !== "boolean" || typeof candidate.message !== "string") return null;
  const message = candidate.message.trim();
  if (message.length > 240) return null;
  return { enabled: candidate.enabled, message };
}
