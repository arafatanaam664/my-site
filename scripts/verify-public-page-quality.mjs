const origin = (process.env.PUBLIC_QA_ORIGIN ?? "http://127.0.0.1:3000").replace(/\/$/, "");

const pages = [
  { path: "/", required: ["<html lang=\"ar\" dir=\"rtl\"", "<main id=\"main-content\""], canonical: true },
  { path: "/tools", required: ["تحويل التاريخ الهجري"], canonical: true },
  { path: "/tools/weekday-calculator", required: ["معرفة يوم الأسبوع"], canonical: true },
  { path: "/articles", required: ["مقالات التقويم والتاريخ الهجري"], canonical: true },
  { path: "/articles/calculate-days-between-two-dates", required: ["كيف تحسب فرق الأيام بين تاريخين بدقة؟", "المرصد البحري الأمريكي", "المعهد الوطني الأمريكي للمعايير"], canonical: true },
  { path: "/calendar/umm-al-qura", required: ["تقويم أم القرى"], canonical: true },
  { path: "/guides/umm-al-qura-calendar-guide", required: ["تقويم أم القرى", "<meta name=\"description\""], canonical: true },
  { path: "/guides/calculate-date-after-days-leap-year-guide", required: ["عدد الأيام", "<meta name=\"description\""], canonical: true },
  { path: "/search?q=%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE", required: ["name=\"robots\" content=\"noindex,follow\""], canonical: false },
];

const outcomes = [];
for (const page of pages) {
  const response = await fetch(`${origin}${page.path}`, { headers: { accept: "text/html" }, signal: AbortSignal.timeout(15_000) });
  const html = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status !== 200) throw new Error(`فشل ${page.path}: حالة HTTP ${response.status}`);
  if (!contentType.includes("text/html")) throw new Error(`فشل ${page.path}: الاستجابة ليست HTML.`);
  for (const value of page.required) if (!html.includes(value)) throw new Error(`فشل ${page.path}: لم يُعثر على المكوّن المتوقع.`);
  if (page.canonical && !/<link rel="canonical" href="https:\/\//.test(html)) throw new Error(`فشل ${page.path}: canonical HTTPS غير موجود.`);
  outcomes.push({ path: page.path, status: response.status, canonical: page.canonical, noindex: html.includes('name="robots" content="noindex,follow"') });
}

console.log(JSON.stringify({ status: "verified", scope: "public_page_structure_and_metadata", pages: outcomes }, null, 2));
