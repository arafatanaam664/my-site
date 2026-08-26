function firstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function authRedirectUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const host = firstForwardedValue(request.headers.get("x-forwarded-host")) ?? request.headers.get("host") ?? requestUrl.host;
  const forwardedProtocol = firstForwardedValue(request.headers.get("x-forwarded-proto"));
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https" ? forwardedProtocol : host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return new URL("/admin", `${protocol}://${host}`).toString();
}
