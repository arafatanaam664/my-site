import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));

const { PUT } = await import("../src/pages/api/admin/content/[id]/sources");

describe("حماية حفظ مصادر المحتوى", () => {
  beforeEach(() => { requireEditor.mockReset(); adminClient.mockReset(); });
  it("يرفض تحديث المصادر الصادر من أصل مختلف قبل التحقق من جلسة المحرر", async () => {
    const request = new Request("https://example.test/api/admin/content/7a8901a4-9a20-4e3c-b6a2-b5ffd029402f/sources", { method: "PUT", headers: { Origin: "https://attacker.test" }, body: JSON.stringify({ sources: [] }) });
    const response = await PUT({ params: { id: "7a8901a4-9a20-4e3c-b6a2-b5ffd029402f" }, request } as unknown as Parameters<typeof PUT>[0]);
    expect(response.status).toBe(403);
    expect(requireEditor).not.toHaveBeenCalled();
  });
});
