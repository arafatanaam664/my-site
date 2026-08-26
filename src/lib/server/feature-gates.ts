import { platformFeatureDefinitions, type PlatformFeatureFlag } from "../platform-foundation";
import { adminClient } from "./admin";

export type PublicFeatureState = Record<PlatformFeatureFlag, boolean>;

function defaults(): PublicFeatureState {
  return Object.fromEntries(platformFeatureDefinitions.map((definition) => [definition.flag, definition.defaultEnabled])) as PublicFeatureState;
}

export async function publicFeatureState(): Promise<PublicFeatureState> {
  const fallback = defaults();
  try {
    const { data, error } = await adminClient().from("feature_flags").select("flag,enabled,public_visible");
    if (error || !data) return fallback;
    for (const row of data) if (row.flag in fallback && row.public_visible) fallback[row.flag as PlatformFeatureFlag] = Boolean(row.enabled);
    return fallback;
  } catch { return fallback; }
}
