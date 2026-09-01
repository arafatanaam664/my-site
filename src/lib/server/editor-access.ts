export const editorialRoles = ["admin", "editor", "author"] as const;
export type EditorialRole = (typeof editorialRoles)[number];

export function isEditorialRole(value: unknown): value is EditorialRole {
  return value === "admin" || value === "editor" || value === "author";
}

export function nextEditorialRole(input: {
  currentRole: string | null;
  allowlistRole: string | null;
  existingEditorCount: number;
}): EditorialRole | null {
  if (isEditorialRole(input.currentRole)) return input.currentRole;
  if (isEditorialRole(input.allowlistRole)) return input.allowlistRole;
  if (input.existingEditorCount <= 0) return "admin";
  return null;
}
