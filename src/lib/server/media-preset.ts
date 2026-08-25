export type MediaPreset = "hero" | "standard" | "compact" | "og";

export function parseMediaPreset(value: string | null): MediaPreset | null {
  return value === "hero" || value === "standard" || value === "compact" || value === "og" ? value : null;
}

export function transformForPreset(preset: MediaPreset, accept: string | null) {
  const width = preset === "hero" || preset === "og" ? 1200 : preset === "standard" ? 768 : 480;
  const format = /image\/avif/i.test(accept ?? "") ? "avif" : /image\/webp/i.test(accept ?? "") ? "webp" : "jpeg";
  return { fit: "scale-down" as const, width, format, quality: preset === "compact" ? 72 : 82 };
}
