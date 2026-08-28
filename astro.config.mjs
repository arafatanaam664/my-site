import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({ imageService: "passthrough", prerenderEnvironment: "node" }),
  output: "server",
  site: "https://alshafra.com",
  trailingSlash: "never",
  prefetch: true,
  server: { host: true, allowedHosts: true },
  vite: {
    ssr: { noExternal: ["@astrojs/cloudflare"] },
    optimizeDeps: { exclude: ["@astrojs/cloudflare"] },
  },
});
