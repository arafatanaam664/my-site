const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const weekdayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;

function parseUtcDate(value: string) {
  if (!datePattern.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function weekdayForGregorianDate(value: string) {
  const date = parseUtcDate(value);
  if (!date) return null;
  return weekdayNames[date.getUTCDay()];
}
