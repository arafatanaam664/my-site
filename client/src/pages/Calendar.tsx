import { CalendarDays, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { RelatedContent } from "@/components/public/RelatedContent";

const eventRows = [
  { title: "التقويم الدراسي", status: "رسمي عند وجود إعلان الجهة المختصة", detail: "يعرض بعد مراجعة المصدر وتاريخ النشر.", source: "وزارة التعليم السعودية", url: "https://www.moe.gov.sa/en/education/generaleducation/pages/academiccalendar.aspx" },
  { title: "تقويم أم القرى", status: "مرجع تقويمي", detail: "يستخدم للتحويل والعرض؛ وقد تختلف أهمية النتيجة بحسب نوع الإجراء.", source: "وزارة المالية السعودية", url: "https://www.mof.gov.sa/en/help/faq/Pages/faq_009.aspx" },
];

export default function Calendar() {
  const [today, setToday] = useState<{ gregorian: string; hijri: string } | null>(null);
  useEffect(() => {
    const now = new Date();
    setToday({
      gregorian: new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now),
      hijri: new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(now),
    });
  }, []);
  return <PublicLayout><section className="page-hero calendar-hero"><div className="site-container"><Breadcrumbs items={[{ label: "التقويم والمواعيد" }]} /><div className="hero-copy compact"><span className="eyebrow"><CalendarDays size={16} /> التقويم والمواعيد</span><h1>تابع المواعيد بوضوح، وافهم حالة كل معلومة</h1><p>لا نعامل كل تاريخ على أنه وعد رسمي. تعرض Alshafra مصدر المعلومة وحالتها ووقت مراجعتها حتى تعرف كيف تستخدمها.</p><div className="hero-actions"><Link href="/tools/date-converter" className="button-primary">تحويل التاريخ</Link><Link href="/articles/official-dates-and-information" className="button-secondary">كيف نتحقق من الموعد؟</Link></div></div></div></section><section className="section"><div className="site-container detail-layout"><div className="event-stack"><section className="today-card" aria-live="polite"><div><span>التاريخ من جهازك</span><h2>{today?.gregorian ?? "جارٍ عرض التاريخ المحلي…"}</h2><p>{today ? `الموافق تقريبًا ${today.hijri}` : "سيظهر التاريخ الهجري عند تحميل الصفحة في متصفحك."}</p></div><CalendarDays size={33} /><small>عرض محلي للاستدلال فقط؛ المواعيد الرسمية تُنشر أدناه بمصدرها.</small></section><div className="section-heading"><div><span className="section-kicker">مصادر مرجعية</span><h2>قواعد النشر في قسم المواعيد</h2></div><Clock3 size={25} /></div>{eventRows.map((event) => <article className="event-card" key={event.title}><div className="event-state"><CheckCircle2 size={18} />{event.status}</div><h3>{event.title}</h3><p>{event.detail}</p><a href={event.url} target="_blank" rel="noreferrer" className="source-link">{event.source}<ExternalLink size={15} /></a></article>)}<div className="source-policy"><ShieldCheck size={21} /><div><h3>سياسة التحديث</h3><p>لا تنشر المنصة موعدًا حساسًا زمنيًا دون مصدر أو حالة. عند غياب إعلان رسمي، يشار إلى المعلومة بوضوح بوصفها إرشادية أو محسوبة.</p></div></div></div><RelatedContent toolIds={["date-converter", "date-difference"]} editorialSlug="official-dates-and-information" /></div></section></PublicLayout>;
}
