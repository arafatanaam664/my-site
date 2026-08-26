const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function parseUtcDate(value: string) {
  if (!datePattern.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return parsed;
}

export function dateWithDayOffset(value: string, amount: number, direction: "after" | "before") {
  if (!Number.isInteger(amount) || amount < 0 || amount > 36_500 || (direction !== "after" && direction !== "before")) return null;
  const date = parseUtcDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + (direction === "after" ? amount : -amount));
  return date.toISOString().slice(0, 10);
}
