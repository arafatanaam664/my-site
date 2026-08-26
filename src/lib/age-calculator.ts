const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

type CalendarDate = { year: number; month: number; day: number };
export type AgeBreakdown = { years: number; months: number; days: number };

function parseDate(value: string): CalendarDate | null {
  const parts = isoDate.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]); const month = Number(parts[2]); const day = Number(parts[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day ? { year, month, day } : null;
}

function daysInMonth(year: number, month: number) { return new Date(Date.UTC(year, month, 0)).getUTCDate(); }

export function ageBetween(birthDate: string, referenceDate: string): AgeBreakdown | null {
  const birth = parseDate(birthDate); const reference = parseDate(referenceDate);
  if (!birth || !reference) return null;
  if (Date.UTC(birth.year, birth.month - 1, birth.day) > Date.UTC(reference.year, reference.month - 1, reference.day)) return null;
  let years = reference.year - birth.year;
  let months = reference.month - birth.month;
  let days = reference.day - birth.day;
  if (days < 0) { months -= 1; const previousMonth = reference.month === 1 ? 12 : reference.month - 1; const previousYear = reference.month === 1 ? reference.year - 1 : reference.year; days += daysInMonth(previousYear, previousMonth); }
  if (months < 0) { years -= 1; months += 12; }
  return years < 0 ? null : { years, months, days };
}
