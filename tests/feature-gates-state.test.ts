import { beforeEach, describe, expect, it, vi } from "vitest";

const adminClient = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ adminClient }));

const { publicFeatureState } = await import("../src/lib/server/feature-gates");

describe("السلوك الفعلي لمفاتيح الإتاحة العامة", () => {
  beforeEach(() => adminClient.mockReset());
  it("يعكس تعطيل المحتوى والأدوات ويتجاهل مفتاحًا داخليًا غير مرئي للعامة", async () => {
    const select = vi.fn().mockResolvedValue({ data: [
      { flag: "content_core", enabled: false, public_visible: true },
      { flag: "tools_core", enabled: false, public_visible: true },
      { flag: "social_publishing", enabled: true, public_visible: false },
    ], error: null });
    adminClient.mockReturnValue({ from: vi.fn().mockReturnValue({ select }) });
    const state = await publicFeatureState();
    expect(state.content_core).toBe(false);
    expect(state.tools_core).toBe(false);
    expect(state.social_publishing).toBe(false);
  });
  it("يعود إلى الإعدادات الآمنة عند فشل تحميل المفاتيح", async () => {
    adminClient.mockReturnValue({ from: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: null, error: { message: "unavailable" } }) }) });
    const state = await publicFeatureState();
    expect(state.content_core).toBe(true);
    expect(state.tools_core).toBe(true);
    expect(state.community).toBe(false);
  });
});
