import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));
vi.mock("../src/lib/server/runtime", () => ({ runtimeSecrets: vi.fn() }));

const { POST } = await import("../src/pages/api/admin/media");

describe("حماية رفع الوسائط", () => {
  beforeEach(() => { requireEditor.mockReset(); adminClient.mockReset(); });
  it("يرفض طلب رفع صادرًا من أصل مختلف قبل التعامل مع جلسة المحرر أو التخزين", async () => {
    const response = await POST({ request: new Request("https://example.test/api/admin/media", { method: "POST", headers: { Origin: "https://attacker.test" }, body: new FormData() }) } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(403);
    expect(requireEditor).not.toHaveBeenCalled();
  });
});
