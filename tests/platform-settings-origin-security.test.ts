import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireAdmin, adminClient }));

const { PATCH } = await import("../src/pages/api/admin/platform/settings");

describe("حماية إعدادات المنصة", () => {
  beforeEach(() => { requireAdmin.mockReset(); adminClient.mockReset(); });
  it("يرفض تعديل الإعداد الصادر من أصل مختلف قبل التحقق من صلاحية المدير", async () => {
    const request = new Request("https://example.test/api/admin/platform/settings", { method: "PATCH", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({ settingKey: "site_notice", value: { enabled: false, message: "" } }) });
    const response = await PATCH({ request } as Parameters<typeof PATCH>[0]);
    expect(response.status).toBe(403);
    expect(requireAdmin).not.toHaveBeenCalled();
  });
});
