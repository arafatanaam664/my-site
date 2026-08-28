import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const configUrl = new URL("../astro.config.mjs", import.meta.url);

describe("إعداد مضيف المعاينة", () => {
  it("يصرح لمضيف المعاينة الحالي من خلال إعداد Astro", async () => {
    const config = await readFile(configUrl, "utf8");
    expect(config).toContain("allowedHosts: true");
  });
});
