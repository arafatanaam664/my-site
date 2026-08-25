export const plannedVariantKeys = ["hero_1200", "standard_768", "compact_480", "og_1200x630"] as const;

export type PlannedVariantKey = (typeof plannedVariantKeys)[number];

export function plannedVariantsFor(mediaId: string) {
  return plannedVariantKeys.map((variantKey) => ({ media_id: mediaId, variant_key: variantKey, status: "on_demand" as const }));
}
