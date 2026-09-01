import { createClient } from "@supabase/supabase-js";
import { developmentAdminIdentity } from "./development-access";
import { runtimeSecrets, timedFetch } from "./runtime";

export type AdminIdentity = { id: string | null; role: "admin" | "editor" | "author" | "analyst"; access: "supabase" | "development" };

function deny(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

export async function requireEditor(request: Request): Promise<AdminIdentity> {
  const developmentIdentity = await developmentAdminIdentity(request);
  if (developmentIdentity) return developmentIdentity;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw deny("غير مصرح. اطلب رابط دخول جديد.", 401);

  const token = authorization.slice("Bearer ".length);
  const secrets = runtimeSecrets();
  const authClient = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) throw deny("غير مصرح. اطلب رابط دخول جديد.", 401);

  const adminClient = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } });
  const { data: profile, error: profileError } = await adminClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profileError || !profile || !["admin", "editor", "author"].includes(profile.role)) throw deny("هذا الحساب بلا صلاحية تحرير. عيّن دوره editor أو admin في جدول profiles.", 403);

  return { id: userData.user.id, role: profile.role as AdminIdentity["role"], access: "supabase" };
}

export async function requireAdmin(request: Request): Promise<AdminIdentity & { role: "admin" }> {
  const identity = await requireEditor(request);
  if (identity.role !== "admin") throw deny("هذه العملية للمدير فقط.", 403);
  return identity as AdminIdentity & { role: "admin" };
}

export function adminClient() {
  const secrets = runtimeSecrets();
  return createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } });
}
