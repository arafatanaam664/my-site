export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";
export type BmiResult = { bmi: number; category: BmiCategory; label: string };

const labels: Record<BmiCategory, string> = {
  underweight: "أقل من المعدل",
  normal: "ضمن المعدل",
  overweight: "أعلى من المعدل",
  obese: "سمنة وفق تصنيف منظمة الصحة العالمية",
};

export function bodyMassIndex(weightKg: number, heightCm: number): BmiResult | null {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || weightKg <= 0 || heightCm < 50 || heightCm > 250) return null;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const category: BmiCategory = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese";
  return { bmi, category, label: labels[category] };
}
