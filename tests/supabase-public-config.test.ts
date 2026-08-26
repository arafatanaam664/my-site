import { describe, expect, it } from "vitest";

describe("إعداد Supabase العام للمعاينة", () => {
  it("يتحقق من وصول قراءة خفيف بالمفتاح القابل للنشر دون إظهار قيمته", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    expect(url).toMatch(/^https:\/\//);
    expect(publishableKey?.length).toBeGreaterThan(20);
    const response = await fetch(`${url}/rest/v1/content_items?select=id&limit=1`, { headers: { apikey: publishableKey!, authorization: `Bearer ${publishableKey}` } });
    expect(response.ok).toBe(true);
  });
});
