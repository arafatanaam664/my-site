import { adminClient } from "./admin";
import { defaultSiteNotice, parseSiteNotice, type SiteNotice } from "../platform-settings";

export async function publicSiteNotice(): Promise<SiteNotice> {
  const { data, error } = await adminClient().from("platform_settings").select("value").eq("setting_key", "site_notice").eq("visibility", "public").maybeSingle();
  if (error || !data) return defaultSiteNotice;
  return parseSiteNotice(data.value) ?? defaultSiteNotice;
}
