import { createClient } from "@supabase/supabase-js";
import { runtimeSecrets } from "./runtime";

export type PublicQuestion = {
  id: string;
  slug: string;
  title: string;
  body_markdown: string;
  answer_count: number;
  score: number;
  created_at: string;
  updated_at: string;
};

export type PublicAnswer = {
  id: string;
  question_id: string;
  body_markdown: string;
  score: number;
  created_at: string;
};

function client() {
  try {
    const secrets = runtimeSecrets();
    return createClient(secrets.SUPABASE_URL, secrets.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

export async function publishedQuestions(limit = 40): Promise<PublicQuestion[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_questions")
    .select("id,slug,title,body_markdown,answer_count,score,created_at,updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as PublicQuestion[];
}

export async function publishedQuestion(slug: string): Promise<PublicQuestion | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("community_questions")
    .select("id,slug,title,body_markdown,answer_count,score,created_at,updated_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as PublicQuestion;
}

export async function publishedAnswers(questionId: string): Promise<PublicAnswer[]> {
  const supabase = client();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("community_answers")
    .select("id,question_id,body_markdown,score,created_at")
    .eq("status", "published")
    .eq("question_id", questionId)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as PublicAnswer[];
}
