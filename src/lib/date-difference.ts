const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

function asUtcDay(value: string) {
  const parts = isoDate.exec(value);
  if (!parts) return null;
  const year = Number(parts[1]); const month = Number(parts[2]); const day = Number(parts[3]);
  const timestamp = Date.UTC(year, month - 1, day); const parsed = new Date(timestamp);
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day ? timestamp : null;
}

export function dateDifferenceDays(start: string, end: string) {
  const startDay = asUtcDay(start); const endDay = asUtcDay(end);
  return startDay === null || endDay === null ? null : Math.abs(endDay - startDay) / 86_400_000;
}
