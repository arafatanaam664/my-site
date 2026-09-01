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

function dbClient(options: { profile?: { role: string } | null; allowlist?: { role: string } | null; editorCount?: number; upsertError?: unknown } = {}) {
  const profile = options.profile === undefined ? { role: "viewer" } : options.profile;
  const allowlist = options.allowlist === undefined ? null : options.allowlist;
  const editorCount = options.editorCount ?? 1;
  return {
    from: vi.fn((table: string) => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      chain.in = vi.fn(() => chain);
      chain.upsert = vi.fn(async () => ({ data: null, error: options.upsertError ?? null }));
      chain.maybeSingle = vi.fn(async () => {
        if (table === "profiles") return { data: profile, error: null };
        if (table === "editor_allowlist") return { data: allowlist, error: null };
        return { data: null, error: null };
      });
      chain.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve({ data: [], error: null, count: table === "profiles" ? editorCount : 0 }).then(resolve, reject);
      return chain;
    }),
  };
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
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "viewer@example.com" } }, error: null }) } };
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(dbClient({ profile: { role: "viewer" }, allowlist: null, editorCount: 2 }));

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

  it("يرقّي المشاهد من قائمة السماح ويعيد هويته", async () => {
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-2", email: "boss@example.com" } }, error: null }) } };
    const db = dbClient({ profile: { role: "viewer" }, allowlist: { role: "admin" }, editorCount: 4 });
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(db);
    await expect(requireEditor(new Request("https://example.test/api/admin/content", { headers: { authorization: "Bearer valid-token" } }))).resolves.toEqual({ id: "user-2", role: "admin", access: "supabase" });
  });

  it("يجعل أول مستخدم مديرًا إن لم يوجد أي محرر", async () => {
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-3", email: "first@example.com" } }, error: null }) } };
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(dbClient({ profile: { role: "viewer" }, allowlist: null, editorCount: 0 }));
    await expect(requireEditor(new Request("https://example.test/api/admin/content", { headers: { authorization: "Bearer valid-token" } }))).resolves.toEqual({ id: "user-3", role: "admin", access: "supabase" });
  });

  it("يسمح للمحرر المصرح ويعيد هويته فقط", async () => {
    const authClient = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "editor-1", email: "editor@example.com" } }, error: null }) } };
    createClient.mockReturnValueOnce(authClient).mockReturnValueOnce(dbClient({ profile: { role: "editor" } }));
    await expect(requireEditor(new Request("https://example.test/api/admin/content", { headers: { authorization: "Bearer valid-token" } }))).resolves.toEqual({ id: "editor-1", role: "editor", access: "supabase" });
  });
});
