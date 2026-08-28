import { describe, expect, it } from "vitest";
import { applyDiscount, discountPercent } from "../src/lib/discount";

describe("حاسبة الخصم", () => {
  it("تحسب التوفير والسعر النهائي ونسبة الخصم", () => {
    expect(applyDiscount(200, 25)).toEqual({ savings: 50, final: 150 });
    expect(discountPercent(200, 150)).toBe(25);
  });

  it("ترفض الأسعار السالبة أو الخصم خارج 0–100", () => {
    expect(applyDiscount(-1, 10)).toBeNull();
    expect(applyDiscount(100, 101)).toBeNull();
    expect(discountPercent(100, 120)).toBeNull();
  });
});
