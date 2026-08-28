function finite(value: number) {
  return Number.isFinite(value);
}

export function percentOf(percent: number, total: number) {
  if (!finite(percent) || !finite(total)) return null;
  return (percent / 100) * total;
}

export function ratioToPercent(part: number, whole: number) {
  if (!finite(part) || !finite(whole) || whole === 0) return null;
  return (part / whole) * 100;
}

export function percentChange(from: number, to: number) {
  if (!finite(from) || !finite(to) || from === 0) return null;
  return ((to - from) / from) * 100;
}
