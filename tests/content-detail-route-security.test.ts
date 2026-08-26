import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));

const { PATCH } = await import("../src/pages/api/admin/content/[id]");

describe("حماية تعديل المحتوى", () => {
  beforeEach(() => { requireEditor.mockReset(); adminClient.mockReset(); });
  it("يرفض تعديلًا صادرًا من أصل مختلف قبل التحقق من الجلسة", async () => {
    const response = await PATCH({ params: { id: "7a8901a4-9a20-4e3c-b6a2-b5ffd029402f" }, request: new Request("https://example.test/api/admin/content/7a8901a4-9a20-4e3c-b6a2-b5ffd029402f", { method: "PATCH", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({}) }) } as unknown as Parameters<typeof PATCH>[0]);
    expect(response.status).toBe(403);
    expect(requireEditor).not.toHaveBeenCalled();
  });
});
