import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: current, error: readError } = await supabase.from("feature_flags").select("enabled,public_visible").eq("flag", "tools_core").maybeSingle();
if (readError || !current) throw readError ?? new Error("لم يُعثر على مفتاح الأدوات.");
const update = async (enabled, note) => {
  const { error } = await supabase.from("feature_flags").update({ enabled, updated_at: new Date().toISOString() }).eq("flag", "tools_core");
  if (error) throw error;
  const { error: auditError } = await supabase.from("feature_flag_audit").insert({ flag: "tools_core", previous_enabled: !enabled, next_enabled: enabled, note });
  if (auditError) throw auditError;
};

try {
  await update(false, "تعطيل مؤقت للتحقق التشغيلي من حجب المسارات والتنقل.");
  const [home, tool, weekdayTool, catalog, search] = await Promise.all([
    fetch("http://127.0.0.1:3000/"),
    fetch("http://127.0.0.1:3000/tools/age-calculator"),
    fetch("http://127.0.0.1:3000/tools/weekday-calculator"),
    fetch("http://127.0.0.1:3000/tools"),
    fetch("http://127.0.0.1:3000/search?q=%D9%8A%D9%88%D9%85"),
  ]);
  const homeHtml = await home.text();
  const searchHtml = await search.text();
  if (tool.status !== 404 || weekdayTool.status !== 404 || catalog.status !== 404 || homeHtml.includes('href="/tools"') || homeHtml.includes('href="/tools/age-calculator"') || homeHtml.includes('href="/tools/weekday-calculator"') || searchHtml.includes('href="/tools/weekday-calculator"')) throw new Error("فشل التحقق: لم تُحجب أدوات أو روابطها كما ينبغي.");
  console.log(JSON.stringify({ status: "verified_disabled", home: home.status, tool: tool.status, weekdayTool: weekdayTool.status, catalog: catalog.status, search: search.status }));
} finally {
  await update(current.enabled, "استعادة حالة الأدوات بعد التحقق التشغيلي المؤقت.");
}
