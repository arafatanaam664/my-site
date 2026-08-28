import { describe, expect, it } from "vitest";
import { bodyMassIndex } from "../src/lib/bmi";

describe("مؤشر كتلة الجسم", () => {
  it("يصنّف النتيجة وفق حدود منظمة الصحة العالمية", () => {
    expect(bodyMassIndex(70, 175)?.category).toBe("normal");
    expect(bodyMassIndex(50, 175)?.category).toBe("underweight");
    expect(bodyMassIndex(90, 175)?.category).toBe("overweight");
    expect(bodyMassIndex(120, 175)?.category).toBe("obese");
  });

  it("ترفض أطوالًا أو أوزانًا غير منطقية", () => {
    expect(bodyMassIndex(0, 170)).toBeNull();
    expect(bodyMassIndex(70, 40)).toBeNull();
  });
});
