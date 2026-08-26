import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireAdmin, adminClient }));

const { GET, POST } = await import("../src/pages/api/admin/community/moderation");

describe("مسار إشراف المجتمع", () => {
  beforeEach(() => { requireAdmin.mockReset(); adminClient.mockReset(); });
  it("يرفض طابور الإشراف دون جلسة مدير", async () => {
    requireAdmin.mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const response = await GET({ request: new Request("https://example.test/api/admin/community/moderation") } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(401);
  });
  it("يرفض قرارًا لا يخص نوع الهدف قبل فتح اتصال قاعدة البيانات", async () => {
    requireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
    const response = await POST({ request: new Request("https://example.test/api/admin/community/moderation", { method: "POST", body: JSON.stringify({ targetType: "answer", targetId: "7a8901a4-9a20-4e3c-b6a2-b5ffd029402f", action: "lock" }) }) } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
    expect(adminClient).not.toHaveBeenCalled();
  });
});
