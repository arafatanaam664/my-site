const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const pages = [
  "/", "/tools", "/tools/date-converter", "/tools/age-calculator", "/tools/date-difference", "/tools/percentage-calculator",
  "/calendar", "/guides", "/guides/understanding-hijri-gregorian-dates", "/guides/calculate-age-correctly",
  "/articles", "/articles/percentage-basics", "/articles/official-dates-and-information", "/search", "/about", "/privacy", "/terms", "/contact",
];
const failures = [];
const linksByPath = new Map();
const fetchWithTimeout = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(8_000) });
const internalPath = (href) => {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  try {
    const target = new URL(href, base);
    if (target.origin !== base) return null;
    return target.pathname.replace(/\/+$/, "") || "/";
  } catch { return null; }
};
for (const path of pages) {
  try {
    const response = await fetchWithTimeout(`${base}${path}`);
    if (response.status !== 200) failures.push(`${path}: expected 200, received ${response.status}`);
    const html = await response.text();
    linksByPath.set(path, new Set([...html.matchAll(/\shref="([^"]+)"/g)].map((match) => internalPath(match[1])).filter(Boolean)));
  } catch (error) { failures.push(`${path}: request failed (${error.name})`); }
}
const uniqueLinks = new Set([...linksByPath.values()].flatMap((links) => [...links]));
for (const link of uniqueLinks) {
  try {
    const response = await fetchWithTimeout(`${base}${link}`, { redirect: "manual" });
    if (![200, 301].includes(response.status)) failures.push(`internal link ${link} returned ${response.status}`);
  } catch (error) { failures.push(`internal link ${link}: request failed (${error.name})`); }
}
const reachable = new Set(["/"]);
const queue = ["/"];
while (queue.length) {
  const path = queue.shift();
  for (const link of linksByPath.get(path) ?? []) if (pages.includes(link) && !reachable.has(link)) { reachable.add(link); queue.push(link); }
}
for (const path of pages) if (!reachable.has(path)) failures.push(`${path}: published route is unreachable from internal HTML links`);
try {
  const redirect = await fetchWithTimeout(`${base}/date-converter`, { redirect: "manual" });
  if (redirect.status !== 301 || redirect.headers.get("location") !== "/tools/date-converter") failures.push("/date-converter: expected 301 to /tools/date-converter");
  const retired = await fetchWithTimeout(`${base}/trending/economy`);
  if (retired.status !== 410) failures.push("/trending/economy: expected 410 for deliberately retired legacy content");
} catch (error) { failures.push(`legacy route check failed (${error.name})`); }
if (failures.length) { console.error("Public route audit failed:\n" + failures.join("\n")); process.exit(1); }
console.log(`Public route audit passed: ${pages.length} published paths, ${uniqueLinks.size} unique internal HTML links, 1 redirect, 1 retired legacy path.`);
