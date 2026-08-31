import { environmentValues } from "./runtime";

const cookieName = "alshafra_dev_admin";
const sessionHeader = "x-alshafra-dev-admin";
const sessionLifetimeSeconds = 60 * 60 * 12;
const encoder = new TextEncoder();
const tokenPattern = /^(\d+)\.([A-Za-z0-9_-]+)$/;

export function isDevelopmentHost(host: string) {
  const normalized = host.toLowerCase().split(":")[0];
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized.endsWith(".manus.computer") || normalized.endsWith(".e2b.app");
}

function requestHost(request: Request) {
  return request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || new URL(request.url).host;
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = encoder.encode(left); const rightBytes = encoder.encode(right); const longest = Math.max(leftBytes.length, rightBytes.length); let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < longest; index += 1) difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  return difference === 0;
}

function base64Url(bytes: Uint8Array) {
  let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function cookieValue(request: Request, name: string) {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

function configFor(request: Request) {
  const code = environmentValues().DEV_ADMIN_ACCESS_CODE;
  return code && code.length >= 16 && isDevelopmentHost(requestHost(request)) ? code : null;
}

function sessionToken(request: Request) {
  const header = request.headers.get(sessionHeader)?.trim() ?? "";
  if (tokenPattern.test(header)) return header;
  const cookie = cookieValue(request, cookieName);
  return cookie && tokenPattern.test(cookie) ? cookie : null;
}

export function developmentAccessEnabled(request: Request) {
  return Boolean(configFor(request));
}

async function identityFromToken(code: string, token: string) {
  const match = tokenPattern.exec(token);
  if (!match) return null;
  const expiresAt = match[1];
  const signature = match[2];
  if (Number(expiresAt) * 1000 < Date.now()) return null;
  return constantTimeEqual(signature, await sign(code, `development-admin:${expiresAt}`)) ? { id: null, role: "admin" as const, access: "development" as const } : null;
}

export async function developmentAdminIdentity(request: Request) {
  const code = configFor(request);
  const token = sessionToken(request);
  if (!code || !token) return null;
  return identityFromToken(code, token);
}

export async function createDevelopmentSession(request: Request, suppliedCode: string) {
  const code = configFor(request);
  if (!code || !constantTimeEqual(code, suppliedCode)) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const signature = await sign(code, `development-admin:${expiresAt}`);
  const token = `${expiresAt}.${signature}`;
  const secure = requestHost(request).startsWith("localhost") || requestHost(request).startsWith("127.0.0.1") ? "" : "; Secure";
  return { token, cookie: `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}` };
}

export function clearDevelopmentSession(request: Request) {
  const secure = requestHost(request).startsWith("localhost") || requestHost(request).startsWith("127.0.0.1") ? "" : "; Secure";
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
