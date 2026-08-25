self.addEventListener("push", (event) => {
  let payload = { title: "Alshafra", body: "مادة جديدة منشورة.", url: "/" };
  try { payload = { ...payload, ...event.data.json() }; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title, { body: payload.body, icon: "/favicon.ico", badge: "/favicon.ico", data: { url: payload.url }, tag: "alshafra-content" }));
});
self.addEventListener("notificationclick", (event) => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data?.url || "/")); });
