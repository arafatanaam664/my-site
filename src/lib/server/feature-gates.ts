import { platformFeatureDefinitions, type PlatformFeatureFlag } from "../platform-foundation";
import { adminClient } from "./admin";
import { withDeadline } from "./deadline";

export type PublicFeatureState = Record<PlatformFeatureFlag, boolean>;

function defaults(): PublicFeatureState {
  return Object.fromEntries(platformFeatureDefinitions.map((definition) => [definition.flag, definition.defaultEnabled])) as PublicFeatureState;
}

export async function publicFeatureState(): Promise<PublicFeatureState> {
  const fallback = defaults();
  return withDeadline(async () => {
    const { data, error } = await adminClient().from("feature_flags").select("flag,enabled,public_visible");
    if (error || !data) return fallback;
    const next = { ...fallback };
    for (const row of data) if (row.flag in next && row.public_visible) next[row.flag as PlatformFeatureFlag] = Boolean(row.enabled);
    return next;
  }, fallback);
}
