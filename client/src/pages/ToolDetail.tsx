import { useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, CircleAlert, RotateCcw } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { RelatedContent } from "@/components/public/RelatedContent";
import { findTool } from "@/content/catalog";

function daysBetween(a: string, b: string) {
  if (!a || !b) return null;
  const start = new Date(`${a}T00:00:00Z`).getTime();
  const end = new Date(`${b}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.abs(Math.round((end - start) / 86_400_000));
}

export default function ToolDetail() {
  const [, params] = useRoute<{ slug: string }>("/tools/:slug");
  const tool = findTool(params?.slug ?? "");
  const [firstDate, setFirstDate] = useState("");
  const [secondDate, setSecondDate] = useState("");
  const [number, setNumber] = useState("");
  const [total, setTotal] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const percentResult = useMemo(() => {
    const a = Number(number); const b = Number(total);
    return number && total && Number.isFinite(a) && Number.isFinite(b) && b !== 0 ? (a / b) * 100 : null;
  }, [number, total]);
  const diff = useMemo(() => daysBetween(firstDate, secondDate), [firstDate, secondDate]);
  const age = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(`${birthDate}T00:00:00Z`); const now = new Date();
    if (Number.isNaN(birth.getTime()) || birth > now) return null;
    let years = now.getUTCFullYear() - birth.getUTCFullYear();
    let months = now.getUTCMonth() - birth.getUTCMonth();
    let days = now.getUTCDate() - birth.getUTCDate();
    if (days < 0) { months -= 1; days += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate(); }
    if (months < 0) { years -= 1; months += 12; }
    return { years, months, days };
  }, [birthDate]);

  if (!tool) return <PublicLayout><section className="empty-page site-container"><h1>الأداة غير موجودة</h1><p>قد تكون الصفحة تغيرت أو لم تُنشر بعد.</p><Link href="/tools" className="button-primary">عرض الأدوات</Link></section></PublicLayout>;

  const reset = () => { setFirstDate(""); setSecondDate(""); setNumber(""); setTotal(""); setBirthDate(""); };
  return <PublicLayout><section className="page-hero soft"><div className="site-container"><Breadcrumbs items={[{ label: "الأدوات", href: "/tools" }, { label: tool.title }]} /><div className="hero-copy compact"><span className="eyebrow">{tool.category}</span><h1>{tool.title}</h1><p>{tool.summary}</p></div></div></section><section className="section"><div className="site-container detail-layout"><div><section className="calculator-panel" aria-label={tool.title}><div className="calculator-top"><span>أدخل البيانات المطلوبة</span><button className="icon-text-button" onClick={reset} type="button"><RotateCcw size={16} />إعادة ضبط</button></div>{tool.id === "percentage" && <><label>الرقم<input value={number} onChange={(event) => setNumber(event.target.value)} type="number" inputMode="decimal" placeholder="مثال: 25" /></label><label>الإجمالي<input value={total} onChange={(event) => setTotal(event.target.value)} type="number" inputMode="decimal" placeholder="مثال: 200" /></label><Result result={percentResult === null ? "أدخل الرقم والإجمالي" : `${percentResult.toLocaleString("ar-SA", { maximumFractionDigits: 2 })}%`} /></>}{tool.id === "date-difference" && <><label>التاريخ الأول<input value={firstDate} onChange={(event) => setFirstDate(event.target.value)} type="date" /></label><label>التاريخ الثاني<input value={secondDate} onChange={(event) => setSecondDate(event.target.value)} type="date" /></label><Result result={diff === null ? "اختر تاريخين" : `${diff.toLocaleString("ar-SA")} يومًا بين التاريخين`} /></>}{tool.id === "age" && <><label>تاريخ الميلاد<input value={birthDate} onChange={(event) => setBirthDate(event.target.value)} type="date" max={new Date().toISOString().slice(0, 10)} /></label><Result result={age ? `${age.years.toLocaleString("ar-SA")} سنة و${age.months.toLocaleString("ar-SA")} شهر و${age.days.toLocaleString("ar-SA")} يوم` : "أدخل تاريخ ميلاد سابق"} /></>}{tool.id === "date-converter" && <DateConverter />}</section><div className="tool-note"><CircleAlert size={19} /><p>هذه الأداة للمساعدة العملية. عند استخدام النتيجة في معاملة أو مستند أو موعد رسمي، راجع الجهة المختصة ومصدرها المنشور.</p></div></div><RelatedContent editorialSlug={tool.relatedGuideSlug} /></div></section></PublicLayout>;
}

function Result({ result }: { result: string }) { return <div className="calculator-result"><span>النتيجة</span><strong>{result}</strong></div>; }

function DateConverter() {
  const [gregorian, setGregorian] = useState("");
  const converted = useMemo(() => {
    if (!gregorian) return null;
    const date = new Date(`${gregorian}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }, [gregorian]);
  return <><label>تاريخ ميلادي<input value={gregorian} onChange={(event) => setGregorian(event.target.value)} type="date" /></label><Result result={converted ?? "اختر تاريخًا ميلاديًا للتحويل"} /><div className="inline-guidance"><CalendarClock size={18} />يعتمد هذا العرض على دعم تقويم أم القرى في المتصفح. تحقّق من الجهة المختصة للمواعيد الرسمية.</div></>;
}
