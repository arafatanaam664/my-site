import { adminClient } from "./admin";
import { publicFeatureState, type PublicFeatureState } from "./feature-gates";
import { withDeadline } from "./deadline";
import {
  buildSectionTree,
  defaultSiteSections,
  isEditorialKind,
  subsectionFeature,
  type SiteSectionNode,
  type SiteSectionRecord,
} from "../site-sections";

function mapRow(row: Record<string, unknown>): SiteSectionRecord | null {
  const id = typeof row.id === "string" ? row.id : "";
  const slug = typeof row.slug === "string" ? row.slug : "";
  const title = typeof row.title === "string" ? row.title : "";
  if (!id || !slug || !title) return null;
  return {
    id,
    slug,
    title,
    description: typeof row.description === "string" ? row.description : "",
    parentId: typeof row.parent_id === "string" ? row.parent_id : null,
    contentKind: isEditorialKind(row.content_kind) ? row.content_kind : null,
    navOrder: typeof row.nav_order === "number" ? row.nav_order : 100,
    enabled: row.enabled !== false,
    publicVisible: row.public_visible !== false,
    systemKey: typeof row.system_key === "string" ? row.system_key : null,
    destinationPath: typeof row.destination_path === "string" ? row.destination_path : null,
  };
}

export async function loadSiteSections(): Promise<SiteSectionRecord[]> {
  const fallback = defaultSiteSections();
  return withDeadline(async () => {
    const { data, error } = await adminClient().from("site_sections").select("id,slug,title,description,parent_id,content_kind,nav_order,enabled,public_visible,system_key,destination_path").order("nav_order");
    if (error || !data?.length) return fallback;
    const mapped = data.map((row) => mapRow(row as Record<string, unknown>)).filter((row): row is SiteSectionRecord => Boolean(row));
    return mapped.length ? mapped : fallback;
  }, fallback);
}

export function visibleSectionTree(records: SiteSectionRecord[], features: PublicFeatureState): SiteSectionNode[] {
  return buildSectionTree(records)
    .filter((hub) => hub.enabled && hub.publicVisible && (subsectionFeature(hub.contentKind, hub.systemKey) ? features[subsectionFeature(hub.contentKind, hub.systemKey)!] : true))
    .map((hub) => ({
      ...hub,
      children: hub.children.filter((child) => {
        if (!child.enabled || !child.publicVisible) return false;
        const feature = subsectionFeature(child.contentKind, child.systemKey);
        return !feature || features[feature];
      }),
    }));
}

export async function publicNavigationTree(features?: PublicFeatureState) {
  const state = features ?? await publicFeatureState();
  return visibleSectionTree(await loadSiteSections(), state);
}

export async function publicSectionRecords() {
  return loadSiteSections();
}
