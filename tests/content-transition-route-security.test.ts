import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));
vi.mock("../src/lib/server/web-push", () => ({ dispatchContentPush: vi.fn() }));

const { POST } = await import("../src/pages/api/admin/content/[id]/transition");

describe("حماية انتقال حالة المحتوى", () => {
  beforeEach(() => { requireEditor.mockReset(); adminClient.mockReset(); });
  it("يرفض قرار نشر صادرًا من أصل مختلف قبل التحقق من جلسة المحرر", async () => {
    const request = new Request("https://example.test/api/admin/content/7a8901a4-9a20-4e3c-b6a2-b5ffd029402f/transition", { method: "POST", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({ status: "published" }) });
    const response = await POST({ params: { id: "7a8901a4-9a20-4e3c-b6a2-b5ffd029402f" }, request } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(403);
    expect(requireEditor).not.toHaveBeenCalled();
  });
});
