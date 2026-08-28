import { describe, expect, it } from "vitest";
import { builtInToolCatalog, searchBuiltInTools } from "../src/lib/tool-catalog";

describe("كتالوج الأدوات", () => {
  it("يعرض تعريفات أدوات حقيقية ذات مسار وغرض ووضع تشغيل معلن", () => {
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "hijri-converter", href: "/tools/hijri-converter", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "date-difference", href: "/tools/date-difference", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "age-calculator", href: "/tools/age-calculator", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "date-offset", href: "/tools/date-offset", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "weekday-calculator", href: "/tools/weekday-calculator", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "percentage", href: "/tools/percentage", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "discount", href: "/tools/discount", mode: "client" }));
    expect(builtInToolCatalog).toContainEqual(expect.objectContaining({ id: "countdown", href: "/tools/countdown", mode: "client" }));
    expect(builtInToolCatalog.every((tool) => tool.title.length > 4 && tool.description.length > 20)).toBe(true);
  });

  it("يعيد الأدوات المطابقة ببحث عربي مطبع من دون اختراع نتائج", () => {
    expect(searchBuiltInTools("العمر").map((tool) => tool.id)).toEqual(["age-calculator"]);
    expect(searchBuiltInTools("تاريخ بعد")[0]?.id).toBe("date-offset");
    expect(searchBuiltInTools("الايام").map((tool) => tool.id)).toContain("date-difference");
    expect(searchBuiltInTools("هجري")[0]?.id).toBe("hijri-converter");
    expect(searchBuiltInTools("خصم")[0]?.id).toBe("discount");
    expect(searchBuiltInTools("بوصلة فضائية")).toEqual([]);
  });
});
