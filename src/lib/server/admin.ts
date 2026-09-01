import { createClient } from "@supabase/supabase-js";
import { developmentAdminIdentity } from "./development-access";
import { isEditorialRole, nextEditorialRole, type EditorialRole } from "./editor-access";
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

  const db = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: timedFetch } });
  const userId = userData.user.id;
  const email = userData.user.email?.trim().toLowerCase() || null;
  const { data: profile } = await db.from("profiles").select("role").eq("id", userId).maybeSingle();
  const currentRole = typeof profile?.role === "string" ? profile.role : null;

  let allowlistRole: string | null = null;
  if (!isEditorialRole(currentRole) && email) {
    const { data: allowed } = await db.from("editor_allowlist").select("role").eq("email", email).maybeSingle();
    allowlistRole = typeof allowed?.role === "string" ? allowed.role : null;
  }

  let existingEditorCount = isEditorialRole(currentRole) ? 1 : 0;
  if (!isEditorialRole(currentRole) && !isEditorialRole(allowlistRole)) {
    const { count } = await db.from("profiles").select("id", { count: "exact", head: true }).in("role", ["admin", "editor", "author"]);
    existingEditorCount = count ?? 0;
  }

  const role = nextEditorialRole({ currentRole, allowlistRole, existingEditorCount });
  if (!role) throw deny("هذا الحساب بلا صلاحية تحرير. أضف بريدك إلى editor_allowlist أو اطلب من مدير الموقع منحك دور editor.", 403);

  if (role !== currentRole) {
    const displayName = typeof userData.user.user_metadata?.name === "string" && userData.user.user_metadata.name.trim()
      ? userData.user.user_metadata.name.trim()
      : (email ? email.split("@")[0] : "محرر");
    const { error: persistError } = await db.from("profiles").upsert({ id: userId, display_name: displayName, role, updated_at: new Date().toISOString() });
    if (persistError) throw deny("تعذر حفظ صلاحية التحرير في جدول profiles.", 500);
    if (email) await db.from("editor_allowlist").upsert({ email, role });
  }

  return { id: userId, role: role as EditorialRole, access: "supabase" };
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
