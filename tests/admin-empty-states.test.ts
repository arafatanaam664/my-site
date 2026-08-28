import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const adminPageUrl = new URL("../src/pages/admin/index.astro", import.meta.url);

describe("حالات لوحة الإدارة الفارغة", () => {
  it("يعرض إجراءً تاليًا صادقًا ولا يوحي بوجود بيانات مصطنعة أو وحدات مفتوحة", async () => {
    const adminPage = await readFile(adminPageUrl, "utf8");

    expect(adminPage).toContain("أنشئ مسودة موثقة لتبدأ دورة التحرير.");
    expect(adminPage).toContain("لا توجد مواد بعد. أنشئ أول مسودة من النموذج.");
    expect(adminPage).toContain("الوحدات الجديدة تبقى متوقفة");
    expect(adminPage).toContain("لا تظهر الوظائف غير الجاهزة للزائر.");
    expect(adminPage).toContain("لا تُعرض أي مادة للعامة إلا بعد اعتمادها ونشرها.");
  });
});
