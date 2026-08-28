function finite(value: number) {
  return Number.isFinite(value);
}

export type DiscountResult = { savings: number; final: number };

export function applyDiscount(price: number, percentOff: number): DiscountResult | null {
  if (!finite(price) || !finite(percentOff) || price < 0 || percentOff < 0 || percentOff > 100) return null;
  const savings = price * (percentOff / 100);
  return { savings, final: price - savings };
}

export function discountPercent(original: number, finalPrice: number) {
  if (!finite(original) || !finite(finalPrice) || original <= 0 || finalPrice < 0 || finalPrice > original) return null;
  return ((original - finalPrice) / original) * 100;
}
