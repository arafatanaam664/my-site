import { describe, expect, it } from "vitest";
import { remainingUntil } from "../src/lib/countdown";

describe("العدّاد التنازلي", () => {
  it("يحسب المتبقي بالأيام والساعات ويرصد انتهاء الوقت", () => {
    const now = new Date("2026-08-28T12:00:00Z");
    expect(remainingUntil("2026-08-30T12:00:00Z", now)).toMatchObject({ days: 2, hours: 0, expired: false });
    expect(remainingUntil("2026-08-28T10:00:00Z", now)?.expired).toBe(true);
    expect(remainingUntil("not-a-date", now)).toBeNull();
  });
});
