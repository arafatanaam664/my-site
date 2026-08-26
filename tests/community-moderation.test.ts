import { describe, expect, it } from "vitest";
import { moderationActionAllowed, moderationTargetIdValid, moderationTransitionMap } from "../src/lib/community-moderation";

describe("ضوابط الإشراف على المجتمع", () => {
  it("يقصر كل قرار على نوع الهدف الذي يدعمه", () => {
    expect(moderationActionAllowed("question", "publish")).toBe(true);
    expect(moderationActionAllowed("answer", "lock")).toBe(false);
    expect(moderationActionAllowed("report", "resolve_report")).toBe(true);
    expect(moderationTransitionMap.question.restore).toBe("pending");
  });
  it("يقبل مرجع البلاغ الرقمي وUUID للأهداف الأخرى فقط", () => {
    expect(moderationTargetIdValid("report", "42")).toBe(true);
    expect(moderationTargetIdValid("report", "uuid")).toBe(false);
    expect(moderationTargetIdValid("question", "7a8901a4-9a20-4e3c-b6a2-b5ffd029402f")).toBe(true);
  });
});
