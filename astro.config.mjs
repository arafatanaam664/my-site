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
    assetsInclude: ["**/*.wasm"],
    ssr: { noExternal: ["@astrojs/cloudflare", "@jsquash/jpeg", "@jsquash/png", "@jsquash/webp", "@jsquash/resize"] },
    optimizeDeps: { exclude: ["@astrojs/cloudflare", "@jsquash/jpeg", "@jsquash/png", "@jsquash/webp", "@jsquash/resize"] },
  },
});
