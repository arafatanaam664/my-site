import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("إعدادات Supabase الخادمية غير متاحة.");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: current, error: readError } = await supabase.from("feature_flags").select("enabled,public_visible").eq("flag", "social_sharing").maybeSingle();
if (readError || !current) throw readError ?? new Error("مفتاح مشاركة المحتوى غير متاح؛ نفّذ ترحيل 0010 أولًا.");
if (current.enabled && current.public_visible) { console.log(JSON.stringify({ status: "already_enabled" })); process.exit(0); }
const { error: updateError } = await supabase.from("feature_flags").update({ enabled: true, public_visible: true, updated_at: new Date().toISOString() }).eq("flag", "social_sharing");
if (updateError) throw updateError;
const { error: auditError } = await supabase.from("feature_flag_audit").insert({ flag: "social_sharing", previous_enabled: current.enabled, next_enabled: true, note: "إتاحة أدوات مشاركة يدوية فقط على المحتوى المنشور؛ لا يتضمن ذلك أي نشر تلقائي." });
if (auditError) throw auditError;
console.log(JSON.stringify({ status: "enabled", previousEnabled: current.enabled, publicVisible: true }));
