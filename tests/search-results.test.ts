import { describe, expect, it } from "vitest";
import { searchAvailableTools } from "../src/lib/search-results";

describe("نتائج الأدوات في البحث", () => {
  it("لا يعرض أدوات حين يكون مفتاح الأدوات العام مغلقًا", () => {
    expect(searchAvailableTools("تاريخ", false)).toEqual([]);
  });

  it("يعرض تعريفات أدوات حقيقية فقط حين يكون المفتاح العام مفعّلًا", () => {
    expect(searchAvailableTools("تاريخ", true).map((tool) => tool.href)).toEqual([
      "/tools/date-offset",
      "/tools/date-difference",
      "/tools/age-calculator",
    ]);
  });
});
