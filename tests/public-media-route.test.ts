import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.fn();
const createClient = vi.fn(() => ({ from }));
const runtimeSecrets = vi.fn(() => ({ SUPABASE_URL: "https://example.test", SUPABASE_SECRET_KEY: "secret", R2_ENDPOINT: "https://r2.example.test", R2_ACCESS_KEY_ID: "key", R2_SECRET_ACCESS_KEY: "secret", R2_BUCKET_NAME: "bucket" }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("../src/lib/server/runtime", () => ({ runtimeSecrets, timedFetch: fetch, requireMediaSecrets: runtimeSecrets }));

const { GET } = await import("../src/pages/media/[id]");

describe("وصول الوسائط العامة", () => {
  beforeEach(() => { from.mockReset(); createClient.mockClear(); runtimeSecrets.mockClear(); });
  it("يرفض وسائط لا ترتبط بأي مادة منشورة قبل محاولة قراءتها من التخزين", async () => {
    from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }) });
    const response = await GET({ params: { id: "c7dd0bb1-2e61-4bf3-aec7-4da52cd8374b" }, request: new Request("https://example.test/media/c7dd0bb1-2e61-4bf3-aec7-4da52cd8374b?source=1") } as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(404);
    expect(createClient).toHaveBeenCalledWith("https://example.test", "secret", expect.any(Object));
  });
});
