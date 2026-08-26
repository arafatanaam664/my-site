import { describe, expect, it } from "vitest";
import { communityPublicStatus, communityStatuses, moderationActions } from "../src/lib/community-foundation";

describe("أساس المجتمع المقفل افتراضيًا", () => {
  it("لا يعامل إلا المحتوى المنشور كمحتوى عام ويحدد إجراءات الإشراف", () => {
    expect(communityStatuses).toContain("pending");
    expect(communityPublicStatus("published")).toBe(true);
    expect(communityPublicStatus("pending")).toBe(false);
    expect(moderationActions).toContain("suspend");
  });
});
