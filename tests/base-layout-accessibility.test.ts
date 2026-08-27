import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("الوصول في التخطيط العام", () => {
  it("يوفر رابط تخطي للمحتوى الرئيسي وموضع تركيز قابلًا للوصول", async () => {
    const [layout, styles] = await Promise.all([
      readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8"),
      readFile(new URL("../src/styles/global.css", import.meta.url), "utf8"),
    ]);
    expect(layout).toContain('class="skip-link" href="#main-content"');
    expect(layout).toContain('<main id="main-content" tabindex="-1">');
    expect(styles).toContain(".skip-link:focus-visible");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});
