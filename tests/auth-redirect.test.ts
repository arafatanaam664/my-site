import { describe, expect, it } from "vitest";
import { authRedirectUrl } from "../src/lib/auth-redirect";

describe("رابط عودة الدخول السحري", () => {
  it("يفضل عنوان المعاينة المعاد توجيهه على localhost في المتصفح المضمّن", () => {
    const request = new Request("http://127.0.0.1:3000/api/public/config", { headers: { "x-forwarded-host": "3000-preview.manus.computer", "x-forwarded-proto": "https" } });
    expect(authRedirectUrl(request)).toBe("https://3000-preview.manus.computer/admin");
  });

  it("يحتفظ بعنوان التطوير المحلي عند غياب عنوان معاد توجيهه", () => {
    expect(authRedirectUrl(new Request("http://localhost:3000/api/public/config"))).toBe("http://localhost:3000/admin");
  });
});
