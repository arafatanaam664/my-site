import { describe, expect, it } from "vitest";
import { vi } from "vitest";

vi.mock("../src/lib/server/runtime", () => ({ environmentValues: () => ({}) }));
import { isDevelopmentHost } from "../src/lib/server/development-access";

describe("وصول التطوير المؤقت", () => {
  it("يقبل مضيف التطوير والمعاينة فقط", () => {
    expect(isDevelopmentHost("localhost:3000")).toBe(true);
    expect(isDevelopmentHost("3000-preview.manus.computer")).toBe(true);
    expect(isDevelopmentHost("3000-preview.e2b.app")).toBe(true);
    expect(isDevelopmentHost("alshafra.com")).toBe(false);
  });

  it("يرفض النطاق النهائي حتى لو وُجد إعداد وصول تطوير بالخطأ", () => {
    expect(isDevelopmentHost("www.alshafra.com")).toBe(false);
  });
});
