import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, BellRing, FilePenLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const cards: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: FilePenLine, title: "المحتوى", text: "مسودات ومراجعات ونشر منضبط" }, { icon: ShieldCheck, title: "المصادر", text: "تتبع المصدر وحالة المراجعة" }, { icon: BellRing, title: "التنبيهات", text: "لا اشتراكات بلا موافقة صريحة" }, { icon: BarChart3, title: "التحليلات", text: "تُعرض بيانات فعلية فقط" },
];

export default function Admin() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: Boolean(user) });
  const [title, setTitle] = useState(""); const [slug, setSlug] = useState(""); const [excerpt, setExcerpt] = useState("");
  const createDraft = trpc.admin.createDraft.useMutation({ onSuccess: async () => { setTitle(""); setSlug(""); setExcerpt(""); await utils.admin.overview.invalidate(); } });
  if (loading) return <div className="min-h-screen grid place-items-center text-sm">جارٍ التحقق من الصلاحية…</div>;
  if (!user) return null;
  if (!["author", "editor", "admin", "super_admin"].includes(user.role)) return <div className="min-h-screen grid place-items-center p-6 text-center"><div><ShieldCheck className="mx-auto mb-3" /><h1 className="text-xl font-bold">هذه المساحة مخصصة لفريق المحتوى</h1><p className="mt-2 text-sm text-muted-foreground">يحتاج حسابك إلى دور محرر أو مدير للوصول إلى إدارة Alshafra.</p></div></div>;
  const metrics = overview.data ? [`${overview.data.content} محتوى`, `${overview.data.sources} مصادر`, `${overview.data.events} مواعيد منشورة`, `${overview.data.optedInNotifications} اشتراك صريح`] : ["جارٍ تحميل البيانات الحقيقية…"];
  return <main className="min-h-screen bg-slate-50 p-6" dir="rtl"><div className="mx-auto max-w-5xl"><span className="text-xs font-bold text-teal-700">إدارة Alshafra</span><h1 className="mt-2 text-3xl font-bold">مساحة نشر ومراجعة المحتوى</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">تبدأ الصفحة كمسودة غير مفهرسة، ثم تنتقل إلى المراجعة والنشر بعد إضافة المصدر والمحتوى الحقيقي.</p><div className="mt-5 flex flex-wrap gap-2">{metrics.map((metric) => <span key={metric} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{metric}</span>)}</div><form className="mt-7 grid gap-3 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); createDraft.mutate({ title, slug, excerpt: excerpt || undefined, type: "article" }); }}><h2 className="md:col-span-2 font-bold">إنشاء مسودة مقالة</h2><input required minLength={8} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان واضح لا يقل عن 8 أحرف" className="rounded-lg border p-3 text-sm"/><input required pattern="[a-z0-9-]+" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-english-only" className="rounded-lg border p-3 text-sm"/><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="ملخص اختياري" className="min-h-20 rounded-lg border p-3 text-sm md:col-span-2"/><button disabled={createDraft.isPending} className="w-fit rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{createDraft.isPending ? "جارٍ الحفظ…" : "حفظ كمسودة"}</button>{createDraft.error && <p className="self-center text-sm text-red-700">تعذر الحفظ: {createDraft.error.message}</p>}</form><section className="mt-8 grid gap-4 md:grid-cols-3">{cards.map((card) => { const Icon = card.icon; return <article key={card.title} className="rounded-2xl border bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-teal-700" /><h2 className="mt-4 font-bold">{card.title}</h2><p className="mt-2 text-sm text-slate-600">{card.text}</p></article>; })}</section></div></main>;
}
