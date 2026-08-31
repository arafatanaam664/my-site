import { describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/server/runtime", () => ({
  environmentValues: () => ({ DEV_ADMIN_ACCESS_CODE: "alshafra-preview-admin" }),
}));

import { createDevelopmentSession, developmentAccessEnabled, developmentAdminIdentity } from "../src/lib/server/development-access";

const previewRequest = (init?: RequestInit) => new Request("https://3000-preview.e2b.app/api/admin/development-access", { ...init, headers: { host: "3000-preview.e2b.app", ...(init?.headers ?? {}) } });

describe("جلسة التطوير عبر رمز الرأس", () => {
  it("تصدر رمزاً موقعاً وتعترف به من ترويسة x-alshafra-dev-admin", async () => {
    expect(developmentAccessEnabled(previewRequest())).toBe(true);
    const session = await createDevelopmentSession(previewRequest({ method: "POST" }), "alshafra-preview-admin");
    expect(session?.token).toMatch(/^\d+\.[A-Za-z0-9_-]+$/);
    const identity = await developmentAdminIdentity(previewRequest({ headers: { "x-alshafra-dev-admin": session!.token } }));
    expect(identity).toEqual({ id: null, role: "admin", access: "development" });
  });

  it("يرفض الرمز الخطأ ولا يعمل على النطاق النهائي", async () => {
    expect(await createDevelopmentSession(previewRequest({ method: "POST" }), "not-the-preview-code")).toBeNull();
    const production = new Request("https://alshafra.com/api/admin/development-access", { headers: { host: "alshafra.com" } });
    expect(developmentAccessEnabled(production)).toBe(false);
    expect(await createDevelopmentSession(production, "alshafra-preview-admin")).toBeNull();
  });
});
