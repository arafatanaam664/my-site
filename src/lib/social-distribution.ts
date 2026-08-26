export const socialProviders = ["x", "facebook", "instagram", "linkedin", "telegram", "whatsapp_channel", "other"] as const;
export const manualOutboxStatuses = ["draft", "ready", "copied", "cancelled"] as const;

export function renderSocialTemplate(template: string, values: { title: string; url: string; excerpt?: string | null }) {
  return template.replaceAll("{{title}}", values.title).replaceAll("{{url}}", values.url).replaceAll("{{excerpt}}", values.excerpt ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
