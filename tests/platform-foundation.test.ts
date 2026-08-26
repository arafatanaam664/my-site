import { describe, expect, it } from "vitest";
import { isPlatformFeatureFlag, platformFeatureDefinitions, publicFeatureSnapshot } from "../src/lib/platform-foundation";

describe("أساس المنصة ومفاتيح الميزات", () => {
  it("يبقي الوحدات الحساسة أو غير المكتملة موقوفة افتراضيًا", () => {
    expect(platformFeatureDefinitions.find((definition) => definition.flag === "community")).toMatchObject({ defaultEnabled: false, publicVisible: false });
    expect(platformFeatureDefinitions.find((definition) => definition.flag === "content_core")).toMatchObject({ defaultEnabled: true, publicVisible: true });
  });

  it("لا يقبل مفتاح ميزة غير معروف ولا يسرب المفاتيح الخاصة إلى واجهة عامة", () => {
    expect(isPlatformFeatureFlag("social_publishing")).toBe(true);
    expect(isPlatformFeatureFlag("unknown_feature")).toBe(false);
    expect(publicFeatureSnapshot([{ flag: "content_core", enabled: true, public_visible: true }, { flag: "community", enabled: false, public_visible: false }])).toEqual([{ flag: "content_core", enabled: true }]);
  });
});
