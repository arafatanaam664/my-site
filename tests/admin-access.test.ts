import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn();

vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("../src/lib/server/runtime", () => ({
  environmentValues: () => ({}),
  timedFetch: fetch,
  runtimeSecrets: () => ({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "publishable-test-key",
    SUPABASE_SECRET_KEY: "secret-test-key",
  }),
}));

const { requireEditor } = await import("../src/lib/server/admin");

function rejectedResponse(status: number) {
  return expect
    .poll(async () => {
      try {
        await requireEditor(new Request("https://example.test/api/admin/content"));
        return 200;
      } catch (error) {
        return error instanceof Response ? error.status : 500;
      }
    })
    .toBe(status);
}

describe("حدود وصول محرر المحتوى", () => {
  beforeEach(() => createClient.mockReset());

  it("يرفض الطلب بلا Authorization برمز 401 قبل إنشاء أي عميل", async () => {
    await rejectedResponse(401);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("يرفض الطلب بلا Authorization بجسم JSON بدل نص Forbidden", async () => {
    try {
      await requireEditor(new Request("https://example.test/api/admin/content"));
      throw new Error("expected rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;
      expect(response.status).toBe(401);
      expect(response.headers.get("content-type")).toContain("application/json");
      await expect(response.json()).resolves.toEqual({ error: "غير مصرح. اطلب رابط دخول جديد." });
    }
  });

  it("يرفض مستخدمًا صحيحًا بلا دور تحريري برمز 403", async () => {
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }) } };
    const privilegedClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: "viewer" }, error: null }) }),
        }),
      }),
    };
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(privilegedClient);

    try {
      await requireEditor(new Request("https://example.test/api/admin/content", { headers: { authorization: "Bearer valid-token" } }));
      throw new Error("expected rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      const response = error as Response;
      expect(response.status).toBe(403);
      expect(response.headers.get("content-type")).toContain("application/json");
      const body = await response.json() as { error: string };
      expect(body.error).toContain("صلاحية تحرير");
    }
  });

  it("يسمح للمحرر المصرح ويعيد هويته فقط", async () => {
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "editor-1" } }, error: null }) } };
    const privilegedClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: vi.fn().mockResolvedValue({ data: { role: "editor" }, error: null }) }),
        }),
      }),
    };
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(privilegedClient);

    await expect(requireEditor(new Request("https://example.test/api/admin/content", { headers: { authorization: "Bearer valid-token" } }))).resolves.toEqual({ id: "editor-1", role: "editor", access: "supabase" });
  });
});
