import { env } from "cloudflare:workers";

type RequiredRuntimeSecrets = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SECRET_KEY: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_BASE_URL?: string;
};

function environmentValues(): Partial<RequiredRuntimeSecrets> {
  const local = typeof process !== "undefined" ? (process.env as Partial<RequiredRuntimeSecrets>) : {};
  const workerValues = Object.fromEntries(Object.entries(env as unknown as Record<string, string | undefined>).filter(([, value]) => Boolean(value))) as Partial<RequiredRuntimeSecrets>;
  return { ...local, ...workerValues };
}

export function runtimeSecrets(): RequiredRuntimeSecrets {
  const values = environmentValues();
  const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"] as const;
  for (const key of required) {
    if (!values[key]) throw new Error(`Missing required runtime secret: ${key}`);
  }
  return values as RequiredRuntimeSecrets;
}

export function publicSupabaseConfig() {
  const values = environmentValues();
  if (!values.SUPABASE_URL || !values.SUPABASE_PUBLISHABLE_KEY) throw new Error("Missing Supabase public configuration");
  return { url: values.SUPABASE_URL, publishableKey: values.SUPABASE_PUBLISHABLE_KEY };
}
