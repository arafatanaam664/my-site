import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://alshafra.com",
  trailingSlash: "never",
  prefetch: true,
});
