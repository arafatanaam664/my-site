export function trackToolUse() {
  if (typeof localStorage === "undefined" || localStorage.getItem("alshafra_analytics_consent_v1") !== "granted") return;
  const key = "alshafra_analytics_session_v1";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  const payload = (eventType: "page_view" | "tool_use") =>
    JSON.stringify({ path: location.pathname, eventType, contentId: null, durationSeconds: null, sessionId });
  const send = (eventType: "page_view" | "tool_use") =>
    fetch("/api/analytics/event", { method: "POST", headers: { "content-type": "text/plain;charset=UTF-8" }, body: payload(eventType), keepalive: true }).catch(() => {});
  const pageWasTracked = sessionStorage.getItem("alshafra_tool_page_view") === location.pathname;
  if (pageWasTracked) void send("tool_use");
  else {
    sessionStorage.setItem("alshafra_tool_page_view", location.pathname);
    void send("page_view").then(() => send("tool_use"));
  }
}
