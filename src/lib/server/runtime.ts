import { env } from "cloudflare:workers";

type RequiredRuntimeSecrets = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SECRET_KEY: string;
  R2_ENDPOINT?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_BASE_URL?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  DEV_ADMIN_ACCESS_CODE?: string;
};

export type MediaRuntimeSecrets = {
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_BASE_URL?: string;
};

export function environmentValues(): Partial<RequiredRuntimeSecrets> {
  const local = typeof process !== "undefined" ? (process.env as Partial<RequiredRuntimeSecrets>) : {};
  const buildPublic = import.meta.env as Record<string, string | undefined>;
  const publicValues: Partial<RequiredRuntimeSecrets> = {
    SUPABASE_URL: buildPublic.VITE_SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: buildPublic.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  const workerValues = Object.fromEntries(Object.entries(env as unknown as Record<string, string | undefined>).filter(([, value]) => Boolean(value))) as Partial<RequiredRuntimeSecrets>;
  return { ...publicValues, ...local, ...workerValues };
}

export async function timedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);
  const parent = init?.signal;
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function runtimeSecrets(): RequiredRuntimeSecrets {
  const values = environmentValues();
  const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"] as const;
  for (const key of required) {
    if (!values[key]) throw new Error(`Missing required runtime secret: ${key}`);
  }
  return values as RequiredRuntimeSecrets;
}

export function requireMediaSecrets(): MediaRuntimeSecrets {
  const values = environmentValues();
  const required = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"] as const;
  for (const key of required) {
    if (!values[key]) throw new Error(`Missing required runtime secret: ${key}`);
  }
  return {
    R2_ENDPOINT: values.R2_ENDPOINT!,
    R2_ACCESS_KEY_ID: values.R2_ACCESS_KEY_ID!,
    R2_SECRET_ACCESS_KEY: values.R2_SECRET_ACCESS_KEY!,
    R2_BUCKET_NAME: values.R2_BUCKET_NAME!,
    R2_PUBLIC_BASE_URL: values.R2_PUBLIC_BASE_URL,
  };
}

export function publicSupabaseConfig() {
  const values = environmentValues();
  if (!values.SUPABASE_URL || !values.SUPABASE_PUBLISHABLE_KEY) throw new Error("Missing Supabase public configuration");
  return { url: values.SUPABASE_URL, publishableKey: values.SUPABASE_PUBLISHABLE_KEY };
}
