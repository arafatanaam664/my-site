import type { APIRoute } from "astro";
import { moderationActionAllowed, moderationTargetIdValid, moderationTransitionMap, type ModerationTargetType } from "../../../../lib/community-moderation";
import { adminClient, requireAdmin } from "../../../../lib/server/admin";

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sameOrigin = (request: Request) => { const origin = request.headers.get("origin"); return !origin || origin === new URL(request.url).origin; };

export const GET: APIRoute = async ({ request }) => {
  try {
    await requireAdmin(request);
    const client = adminClient();
    const [questions, answers, reports, actions] = await Promise.all([
      client.from("community_questions").select("id,title,body_markdown,status,author_id,created_at").in("status", ["pending", "locked"]).order("created_at", { ascending: true }).limit(30),
      client.from("community_answers").select("id,question_id,body_markdown,status,author_id,created_at").eq("status", "pending").order("created_at", { ascending: true }).limit(30),
      client.from("community_reports").select("id,target_type,target_id,reason,status,reporter_id,created_at").in("status", ["open", "under_review"]).order("created_at", { ascending: true }).limit(30),
      client.from("community_moderation_actions").select("id,target_type,target_id,action,note,created_at").order("created_at", { ascending: false }).limit(30),
    ]);
    if (questions.error || answers.error || reports.error || actions.error) return json({ error: "تعذر تحميل طابور الإشراف" }, 500);
    return json({ data: { questions: questions.data ?? [], answers: answers.data ?? [], reports: reports.data ?? [], actions: actions.data ?? [] } });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة المجتمع" }, error.status);
    return json({ error: "تعذر تحميل طابور الإشراف" }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!sameOrigin(request)) return json({ error: "مصدر الطلب غير مسموح" }, 403);
    const actor = await requireAdmin(request);
    const payload = await request.json().catch(() => null) as { targetType?: unknown; targetId?: unknown; action?: unknown; note?: unknown } | null;
    if (!payload || typeof payload.targetType !== "string" || typeof payload.action !== "string" || !moderationActionAllowed(payload.targetType, payload.action) || !moderationTargetIdValid(payload.targetType, payload.targetId)) return json({ error: "قرار الإشراف غير صالح" }, 400);
    const targetType = payload.targetType as ModerationTargetType; const targetId = payload.targetId as string; const action = payload.action; const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 1000) : null; const client = adminClient();
    let error: { message?: string } | null = null; let found = false;
    if (targetType === "question") { const result = await client.from("community_questions").update({ status: moderationTransitionMap.question[action as keyof typeof moderationTransitionMap.question], updated_at: new Date().toISOString() }).eq("id", targetId).select("id").maybeSingle(); error = result.error; found = Boolean(result.data); }
    if (targetType === "answer") { const result = await client.from("community_answers").update({ status: moderationTransitionMap.answer[action as keyof typeof moderationTransitionMap.answer], updated_at: new Date().toISOString() }).eq("id", targetId).select("id").maybeSingle(); error = result.error; found = Boolean(result.data); }
    if (targetType === "member") { const result = await client.from("member_profiles").update({ is_suspended: moderationTransitionMap.member[action as keyof typeof moderationTransitionMap.member], updated_at: new Date().toISOString() }).eq("id", targetId).select("id").maybeSingle(); error = result.error; found = Boolean(result.data); }
    if (targetType === "report") { const status = moderationTransitionMap.report[action as keyof typeof moderationTransitionMap.report]; const result = await client.from("community_reports").update({ status, resolved_at: new Date().toISOString() }).eq("id", Number(targetId)).select("id").maybeSingle(); error = result.error; found = Boolean(result.data); }
    if (error || !found) return json({ error: "لم يُعثر على الهدف أو تعذر تحديثه" }, 404);
    const { error: auditError } = await client.from("community_moderation_actions").insert({ moderator_id: actor.id ?? null, target_type: targetType, target_id: targetId, action, note });
    if (auditError) return json({ error: "تم تحديث الهدف لكن تعذر حفظ سجل القرار" }, 500);
    return json({ data: { targetType, targetId, action } });
  } catch (error) {
    if (error instanceof Response) return json({ error: error.status === 401 ? "يلزم تسجيل الدخول" : "لا تملك صلاحية إدارة المجتمع" }, error.status);
    return json({ error: "تعذر تنفيذ قرار الإشراف" }, 500);
  }
};
