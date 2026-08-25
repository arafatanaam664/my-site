import { beforeEach, describe, expect, it, vi } from "vitest";

const adminClient = vi.fn();
const anonymizeAnalyticsEvent = vi.fn();
vi.mock("../src/lib/server/admin", () => ({ adminClient }));
vi.mock("../src/lib/server/analytics", async () => {
  const actual = await vi.importActual<typeof import("../src/lib/server/analytics")>("../src/lib/server/analytics");
  return { ...actual, anonymizeAnalyticsEvent };
});

const { POST } = await import("../src/pages/api/analytics/event");
const event = { path: "/articles/example", eventType: "read_50", contentId: null, durationSeconds: null, anonymousDayHash: "day", sessionHash: "session" };
const request = () => new Request("https://alshafra.com/api/analytics/event", { method: "POST", headers: { origin: "https://alshafra.com" }, body: JSON.stringify({}) });

function clientWithPrerequisite(found: boolean) {
  const from = vi.fn(); const duplicate = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [] }) }) }) }) }) }) };
  const prior = { select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ gte: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: found ? [{ id: 1 }] : [] }) }) }) }) }) }) };
  const insert = vi.fn().mockResolvedValue({ error: null });
  from.mockReturnValueOnce(duplicate).mockReturnValueOnce(prior).mockReturnValueOnce({ insert });
  return { from, insert };
}

describe("واجهة أحداث التحليلات", () => {
  beforeEach(() => { anonymizeAnalyticsEvent.mockReset().mockResolvedValue(event); adminClient.mockReset(); });
  it("ترفض read_50 عندما لا توجد read_25 سابقة", async () => {
    const client = clientWithPrerequisite(false); adminClient.mockReturnValue({ from: client.from });
    expect((await POST({ request: request() } as never)).status).toBe(204); expect(client.insert).not.toHaveBeenCalled();
  });

  it("ترفض read_75 دون read_50 وread_complete دون read_75", async () => {
    for (const eventType of ["read_75", "read_complete"] as const) {
      anonymizeAnalyticsEvent.mockResolvedValue({ ...event, eventType }); const client = clientWithPrerequisite(false); adminClient.mockReturnValue({ from: client.from });
      expect((await POST({ request: request() } as never)).status).toBe(204); expect(client.insert).not.toHaveBeenCalled();
    }
  });

  it("تقبل read_50 بعد وجود read_25 في الجلسة والمسار نفسيهما", async () => {
    const client = clientWithPrerequisite(true); adminClient.mockReturnValue({ from: client.from });
    expect((await POST({ request: request() } as never)).status).toBe(202); expect(client.insert).toHaveBeenCalledTimes(1);
  });

  it("تقبل كل خطوة من تسلسل القراءة الكامل فقط مع سابقها", async () => {
    for (const eventType of ["read_25", "read_50", "read_75", "read_complete"] as const) {
      anonymizeAnalyticsEvent.mockResolvedValue({ ...event, eventType }); const client = clientWithPrerequisite(true); adminClient.mockReturnValue({ from: client.from });
      expect((await POST({ request: request() } as never)).status).toBe(202); expect(client.insert).toHaveBeenCalledTimes(1);
    }
  });
});
