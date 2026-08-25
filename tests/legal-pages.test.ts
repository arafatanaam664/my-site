import { describe, expect, it } from "vitest";
import { legalPages } from "../src/lib/legal-pages";

describe("صفحات الثقة والقانون", () => {
  it("تتضمن الصفحات الأساسية دون ادعاء أن الإعلانات أو القياس مفعلان", () => {
    for (const page of ["about", "methodology", "privacy", "terms", "cookies", "ads", "copyright", "contact"]) expect(legalPages[page]).toBeDefined();
    expect(legalPages.ads.sections[0].paragraphs.join(" ")).toContain("لا تعرض");
    expect(legalPages.privacy.sections[0].paragraphs.join(" ")).toContain("لا تتطلب");
  });
});
