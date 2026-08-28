export type CountdownRemaining = { days: number; hours: number; minutes: number; seconds: number; expired: boolean; totalMs: number };

export function remainingUntil(isoDateTime: string, now = new Date()): CountdownRemaining | null {
  const target = Date.parse(isoDateTime);
  if (Number.isNaN(target)) return null;
  const totalMs = target - now.getTime();
  const expired = totalMs <= 0;
  const abs = Math.max(0, totalMs);
  return {
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor(abs / 3_600_000) % 24,
    minutes: Math.floor(abs / 60_000) % 60,
    seconds: Math.floor(abs / 1_000) % 60,
    expired,
    totalMs,
  };
}
