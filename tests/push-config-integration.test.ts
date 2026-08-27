import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const localOrigin = process.env.LOCAL_APP_ORIGIN ?? "http://127.0.0.1:3000";

describe("إعداد Web Push", () => {
  it("يمرر متغيرات VAPID إلى Worker المحلي من دون تضمين قيمها في المصدر", async () => {
    const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
    expect(packageJson).toContain("--var VAPID_PUBLIC_KEY:$VAPID_PUBLIC_KEY");
    expect(packageJson).toContain("--var VAPID_PRIVATE_KEY:$VAPID_PRIVATE_KEY");
    expect(packageJson).toContain("--var VAPID_SUBJECT:$VAPID_SUBJECT");
  });

  it("يعيد نقطة الإعداد المفتاح العام عند توفر قيم VAPID ولا يكشف القيم السرية", async () => {
    expect(process.env.VAPID_PUBLIC_KEY).toBeTruthy();
    expect(process.env.VAPID_PRIVATE_KEY).toBeTruthy();
    expect(process.env.VAPID_SUBJECT).toMatch(/^(mailto:|https:\/\/)/);

    const response = await fetch(new URL("/api/public/push-config", localOrigin), { signal: AbortSignal.timeout(10_000) });
    expect(response.status).toBe(200);
    const configuration = await response.json() as { enabled?: boolean; publicKey?: string; privateKey?: string; subject?: string };

    expect(configuration).toEqual({ enabled: true, publicKey: process.env.VAPID_PUBLIC_KEY });
    expect(configuration).not.toHaveProperty("privateKey");
    expect(configuration).not.toHaveProperty("subject");
  });
});
