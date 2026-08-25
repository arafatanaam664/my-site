import { beforeEach, describe, expect, it, vi } from "vitest";

const requireEditor = vi.fn();
const adminClient = vi.fn();

vi.mock("../src/lib/server/admin", () => ({ requireEditor, adminClient }));

const { GET, PUT } = await import("../src/pages/api/admin/content/[id]/sources");

function request(method: string, body?: unknown) {
  return new Request("https://example.test/api/admin/content/11111111-1111-1111-1111-111111111111/sources", { method, headers: { authorization: "Bearer token", "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
}

describe("واجهة مصادر المادة", () => {
  beforeEach(() => {
    requireEditor.mockReset().mockResolvedValue({ id: "editor-1", role: "editor" });
    adminClient.mockReset();
  });

  it("يعرض المصادر من دون الاعتماد على عمود غير موجود في content_sources", async () => {
    const contentChain = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: "11111111-1111-1111-1111-111111111111", status: "draft", created_by: "author-1" }, error: null }) }) }) };
    const sourceChain = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [{ note: null, sources: { title: "مصدر", url: "https://example.com", accessed_at: "2026-08-25T12:00:00Z" } }], error: null }) }) };
    const from = vi.fn((table: string) => table === "content_items" ? contentChain : sourceChain);
    adminClient.mockReturnValue({ from });

    const response = await GET({ params: { id: "11111111-1111-1111-1111-111111111111" }, request: request("GET") } as never);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [{ note: null, sources: { title: "مصدر", url: "https://example.com", accessed_at: "2026-08-25T12:00:00Z" } }] });
  });

  it("يرفض حفظ مصدر برابط غير آمن قبل لمس قاعدة البيانات", async () => {
    const contentChain = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: "11111111-1111-1111-1111-111111111111", status: "draft", created_by: "author-1" }, error: null }) }) }) };
    const from = vi.fn(() => contentChain);
    adminClient.mockReturnValue({ from });

    const response = await PUT({ params: { id: "11111111-1111-1111-1111-111111111111" }, request: request("PUT", { sources: [{ title: "مصدر غير آمن", url: "http://example.com", kind: "official" }] }) } as never);
    expect(response.status).toBe(400);
    expect(from).toHaveBeenCalledTimes(1);
  });
});
