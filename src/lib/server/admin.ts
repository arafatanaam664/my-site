import { createClient } from "@supabase/supabase-js";
import { runtimeSecrets } from "./runtime";

export type AdminIdentity = { id: string; role: "admin" | "editor" | "author" | "analyst" };

export async function requireEditor(request: Request): Promise<AdminIdentity> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Response("Unauthorized", { status: 401 });

  const token = authorization.slice("Bearer ".length);
  const secrets = runtimeSecrets();
  const authClient = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) throw new Response("Unauthorized", { status: 401 });

  const adminClient = createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: profile, error: profileError } = await adminClient.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  if (profileError || !profile || !["admin", "editor", "author"].includes(profile.role)) throw new Response("Forbidden", { status: 403 });

  return { id: userData.user.id, role: profile.role as AdminIdentity["role"] };
}

export function adminClient() {
  const secrets = runtimeSecrets();
  return createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
