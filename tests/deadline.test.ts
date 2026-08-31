import { describe, expect, it } from "vitest";
import { withDeadline } from "../src/lib/server/deadline";

describe("مهلة استعلام القاعدة", () => {
  it("تعيد البديل إذا لم يكتمل العمل في الوقت المحدد", async () => {
    const result = await withDeadline(() => new Promise<string>(() => {}), "fallback", 20);
    expect(result).toBe("fallback");
  });

  it("تعيد النتيجة عندما تكتمل قبل المهلة", async () => {
    const result = await withDeadline(async () => "ok", "fallback", 200);
    expect(result).toBe("ok");
  });
});
