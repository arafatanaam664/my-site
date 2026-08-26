import { describe, expect, it } from "vitest";
import { manualOutboxStatuses, renderSocialTemplate, socialProviders } from "../src/lib/social-distribution";

describe("التوزيع اليدوي الآمن", () => {
  it("يبقي الحالات يدوية ويعرض نص القالب من بيانات منشورة", () => {
    expect(manualOutboxStatuses).not.toContain("sent");
    expect(socialProviders).toContain("telegram");
    expect(renderSocialTemplate("{{title}}\n{{excerpt}}\n{{url}}", { title: "دليل", excerpt: "ملخص", url: "https://alshafra.com/guides/example" })).toBe("دليل\nملخص\nhttps://alshafra.com/guides/example");
  });
});
