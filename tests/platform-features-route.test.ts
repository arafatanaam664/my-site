import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireAdmin, adminClient }));

const { GET, PATCH } = await import("../src/pages/api/admin/platform/features");

describe("إدارة مفاتيح الميزات", () => {
  beforeEach(() => { requireAdmin.mockReset(); adminClient.mockReset(); });

  it("يرفض قراءة المفاتيح دون جلسة مدير", async () => {
    requireAdmin.mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const response = await GET({ request: new Request("https://example.test/api/admin/platform/features") } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(401);
  });

  it("يرفض مفتاحًا غير معروف قبل التعامل مع قاعدة البيانات", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
    const response = await PATCH({ request: new Request("https://example.test/api/admin/platform/features", { method: "PATCH", body: JSON.stringify({ flag: "unknown", enabled: true }) }) } as Parameters<typeof PATCH>[0]);
    expect(response.status).toBe(400);
    expect(adminClient).not.toHaveBeenCalled();
  });
  it("يرفض تعديلًا صادرًا من أصل مختلف قبل التحقق من صلاحية المدير", async () => {
    const request = new Request("https://example.test/api/admin/platform/features", { method: "PATCH", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({ flag: "tools_core", enabled: false }) });
    const response = await PATCH({ request } as Parameters<typeof PATCH>[0]);
    expect(response.status).toBe(403);
    expect(requireAdmin).not.toHaveBeenCalled();
  });
});
