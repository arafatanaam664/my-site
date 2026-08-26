import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));

const { POST } = await import("../src/pages/api/admin/content");

describe("حماية إنشاء المحتوى", () => {
  beforeEach(() => { requireEditor.mockReset(); adminClient.mockReset(); });
  it("يرفض طلب إنشاء مسودة صادرًا من أصل مختلف قبل التحقق من الجلسة", async () => {
    const response = await POST({ request: new Request("https://example.test/api/admin/content", { method: "POST", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({}) }) } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(403);
    expect(requireEditor).not.toHaveBeenCalled();
  });
});
