import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireAdmin, adminClient }));

const { GET, POST } = await import("../src/pages/api/admin/social/distribution");

describe("إدارة التوزيع اليدوي", () => {
  beforeEach(() => { requireAdmin.mockReset(); adminClient.mockReset(); });
  it("يرفض الوصول دون جلسة مدير", async () => {
    requireAdmin.mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const response = await GET({ request: new Request("https://example.test/api/admin/social/distribution") } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(401);
  });
  it("يرفض قالبًا قصيرًا قبل التعامل مع قاعدة البيانات", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
    const response = await POST({ request: new Request("https://example.test/api/admin/social/distribution", { method: "POST", body: JSON.stringify({ action: "create_template", name: "أ", bodyTemplate: "قصير" }) }) } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
    expect(adminClient).not.toHaveBeenCalled();
  });
  it("يرفض طلب كتابة صادرًا من أصل مختلف", async () => {
    const response = await POST({ request: new Request("https://example.test/api/admin/social/distribution", { method: "POST", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({ action: "create_account" }) }) } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(403);
    expect(requireAdmin).not.toHaveBeenCalled();
  });
});
