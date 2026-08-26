import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: current, error: readError } = await supabase.from("feature_flags").select("enabled,public_visible").eq("flag", "content_core").maybeSingle();
if (readError || !current) throw readError ?? new Error("لم يُعثر على مفتاح المحتوى.");
const update = async (enabled, note) => {
  const { error } = await supabase.from("feature_flags").update({ enabled, updated_at: new Date().toISOString() }).eq("flag", "content_core");
  if (error) throw error;
  const { error: auditError } = await supabase.from("feature_flag_audit").insert({ flag: "content_core", previous_enabled: !enabled, next_enabled: enabled, note });
  if (auditError) throw auditError;
};

try {
  await update(false, "تعطيل مؤقت للتحقق التشغيلي من حجب المحتوى وروابطه.");
  const [home, guides, articles, guide] = await Promise.all([
    fetch("http://127.0.0.1:3000/"),
    fetch("http://127.0.0.1:3000/guides"),
    fetch("http://127.0.0.1:3000/articles"),
    fetch("http://127.0.0.1:3000/guides/umm-al-qura-calendar-guide"),
  ]);
  const homeHtml = await home.text();
  if (guides.status !== 404 || articles.status !== 404 || guide.status !== 404 || homeHtml.includes('href="/guides"') || homeHtml.includes('href="/articles"')) throw new Error("فشل التحقق: لم تُحجب صفحات المحتوى أو روابطها كما ينبغي.");
  console.log(JSON.stringify({ status: "verified_disabled", home: home.status, guides: guides.status, articles: articles.status, guide: guide.status }));
} finally {
  await update(current.enabled, "استعادة حالة المحتوى بعد التحقق التشغيلي المؤقت.");
}
