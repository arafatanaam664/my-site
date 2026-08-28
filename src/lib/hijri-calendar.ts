const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

export const hijriMonthNames = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
] as const;

export type CalendarYmd = { year: number; month: number; day: number };
export type HijriDate = CalendarYmd & { monthName: string };

const ISLAMIC_EPOCH_JDN = 1948440;

function parseIso(value: string): CalendarYmd | null {
  const parts = isoDate.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  return isValidGregorian(year, month, day) ? { year, month, day } : null;
}

export function isValidGregorian(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 622 || year > 3200 || month < 1 || month > 12 || day < 1) return false;
  const utc = Date.UTC(year, month - 1, day);
  const parsed = new Date(utc);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function gregorianToJdn(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function jdnToGregorian(jdn: number): CalendarYmd {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function islamicToJdn(year: number, month: number, day: number) {
  return day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + ISLAMIC_EPOCH_JDN - 1;
}

export function jdnToIslamic(jdn: number): CalendarYmd {
  const year = Math.floor((30 * (jdn - ISLAMIC_EPOCH_JDN) + 10646) / 10631);
  const month = Math.min(12, Math.ceil((jdn - 29 - islamicToJdn(year, 1, 1)) / 29.5) + 1);
  const day = jdn - islamicToJdn(year, month, 1) + 1;
  return { year, month, day };
}

export function hijriMonthLength(year: number, month: number) {
  if (month < 1 || month > 12 || year < 1) return null;
  return islamicToJdn(year, month, 1) ? islamicToJdn(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1) - islamicToJdn(year, month, 1) : null;
}

export function isValidHijri(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1 || year > 1800 || month < 1 || month > 12 || day < 1) return false;
  const length = hijriMonthLength(year, month);
  return length !== null && day <= length;
}

export function formatIso({ year, month, day }: CalendarYmd) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function gregorianToHijri(iso: string): HijriDate | null {
  const gregorian = parseIso(iso);
  if (!gregorian) return null;
  const hijri = jdnToIslamic(gregorianToJdn(gregorian.year, gregorian.month, gregorian.day));
  if (!isValidHijri(hijri.year, hijri.month, hijri.day)) return null;
  return { ...hijri, monthName: hijriMonthNames[hijri.month - 1] };
}

export function hijriToGregorian(year: number, month: number, day: number): CalendarYmd | null {
  if (!isValidHijri(year, month, day)) return null;
  return jdnToGregorian(islamicToJdn(year, month, day));
}

export function hijriToGregorianIso(year: number, month: number, day: number) {
  const gregorian = hijriToGregorian(year, month, day);
  return gregorian ? formatIso(gregorian) : null;
}
