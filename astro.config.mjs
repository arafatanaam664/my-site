import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({ imageService: "passthrough", prerenderEnvironment: "node" }),
  output: "server",
  site: "https://alshafra.com",
  trailingSlash: "never",
  prefetch: true,
  server: { allowedHosts: ["3000-igrycpt3pzscmeqwsre56-029d6cb6.us4.manus.computer"] },
  vite: {
    ssr: { noExternal: ["@astrojs/cloudflare"] },
    optimizeDeps: { exclude: ["@astrojs/cloudflare"] },
  },
});
