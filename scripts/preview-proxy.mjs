import http from "node:http";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

function loadEnvFile(relativePath) {
  try {
    const envFile = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    for (const raw of envFile.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator <= 0) continue;
      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (key && process.env[key] == null) process.env[key] = value;
    }
  } catch {
    // optional local env files
  }
}

loadEnvFile("../.preview.env");
loadEnvFile("../.env");

const listenPort = Number(process.env.PREVIEW_PORT ?? 3000);
const targetPort = Number(process.env.WORKER_PORT ?? 8787);

const server = http.createServer((req, res) => {
  const headers = { ...req.headers };
  const proxyReq = http.request(
    {
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", () => {
    if (!res.headersSent) res.writeHead(503, { "content-type": "text/plain; charset=utf-8" });
    res.end("المعاينة قيد التشغيل…");
  });
  req.pipe(proxyReq);
});

server.listen(listenPort, "0.0.0.0", () => {
  const vars = [];
  for (const key of ["DEV_ADMIN_ACCESS_CODE", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"]) {
    if (process.env[key]) vars.push("--var", `${key}:${process.env[key]}`);
  }
  const child = spawn(
    "pnpm",
    [
      "exec",
      "wrangler",
      "dev",
      "--config",
      "dist/server/wrangler.json",
      "--ip",
      "127.0.0.1",
      "--port",
      String(targetPort),
      "--inspector-ip",
      "127.0.0.1",
      "--show-interactive-dev-session",
      "false",
      ...vars,
    ],
    { stdio: "inherit", cwd: new URL("..", import.meta.url).pathname },
  );
  child.on("exit", (code) => process.exit(code ?? 1));
});
