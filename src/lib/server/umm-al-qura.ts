export type UmmAlQuraDate = {
  gregorian: { day: string; month: string; year: string; weekday: string };
  hijri: { day: string; month: string; year: string; weekday: string; method: string };
  source: "AlAdhan";
  sourceUrl: string;
  fetchedAt: string;
};

type AlAdhanEnvelope = { code: number; data?: { hijri?: { day?: string; year?: string; weekday?: { ar?: string }; month?: { ar?: string }; method?: string }; gregorian?: { day?: string; year?: string; month?: { number?: number }; weekday?: { en?: string } } } };

export function gregorianDateInRiyadh(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return { day: value("day"), month: value("month"), year: value("year") };
}

export function alAdhanUrl({ day, month, year }: { day: string; month: string; year: string }) {
  return `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`;
}

export function parseUmmAlQura(payload: unknown, sourceUrl: string, fetchedAt = new Date().toISOString()): UmmAlQuraDate | null {
  const response = payload as AlAdhanEnvelope;
  const hijri = response?.data?.hijri;
  const gregorian = response?.data?.gregorian;
  if (response?.code !== 200 || !hijri?.day || !hijri.year || !hijri.month?.ar || !hijri.weekday?.ar || !gregorian?.day || !gregorian.year || !gregorian.month?.number) return null;
  if (hijri.method !== "HJCoSA") return null;
  return { gregorian: { day: gregorian.day, month: String(gregorian.month.number).padStart(2, "0"), year: gregorian.year, weekday: gregorian.weekday?.en ?? "" }, hijri: { day: hijri.day, month: hijri.month.ar, year: hijri.year, weekday: hijri.weekday.ar, method: hijri.method }, source: "AlAdhan", sourceUrl, fetchedAt };
}

export async function fetchUmmAlQura(date = new Date()) {
  const gregorian = gregorianDateInRiyadh(date);
  const sourceUrl = alAdhanUrl(gregorian);
  const response = await fetch(sourceUrl, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return null;
  return parseUmmAlQura(await response.json(), sourceUrl);
}
