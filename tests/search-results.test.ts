import { describe, expect, it } from "vitest";
import { searchAvailableTools } from "../src/lib/search-results";

describe("نتائج الأدوات في البحث", () => {
  it("لا يعرض أدوات حين يكون مفتاح الأدوات العام مغلقًا", () => {
    expect(searchAvailableTools("تاريخ", false)).toEqual([]);
  });

  it("يعرض تعريفات أدوات حقيقية فقط حين يكون المفتاح العام مفعّلًا", () => {
    const hrefs = searchAvailableTools("تاريخ", true).map((tool) => tool.href);
    expect(hrefs).toContain("/tools/hijri-converter");
    expect(hrefs).toContain("/tools/date-difference");
    expect(hrefs).toContain("/tools/date-offset");
    expect(searchAvailableTools("نسبة", true)[0]?.href).toBe("/tools/percentage");
  });
});
