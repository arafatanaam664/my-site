import { createClient } from "@supabase/supabase-js";

const [flag, requested] = process.argv.slice(2);
if (!flag || !["true", "false"].includes(requested)) throw new Error("الاستخدام: node scripts/set-public-feature-flag.mjs <flag> <true|false>");
const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: current, error: readError } = await supabase.from("feature_flags").select("enabled").eq("flag", flag).maybeSingle();
if (readError || !current) throw readError ?? new Error("لم يُعثر على مفتاح الإتاحة.");
const enabled = requested === "true";
if (current.enabled === enabled) { console.log(JSON.stringify({ status: "unchanged", flag, enabled })); process.exit(0); }
const { error: updateError } = await supabase.from("feature_flags").update({ enabled, updated_at: new Date().toISOString() }).eq("flag", flag);
if (updateError) throw updateError;
const { error: auditError } = await supabase.from("feature_flag_audit").insert({ flag, previous_enabled: current.enabled, next_enabled: enabled, note: "تبديل مؤقت موثق للتحقق المرئي من حراسة الإتاحة." });
if (auditError) throw auditError;
console.log(JSON.stringify({ status: "updated", flag, enabled }));
