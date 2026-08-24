import { ArrowLeft, BookOpenText, CalendarDays, CheckCircle2, Compass, Search, Sparkles, Wrench } from "lucide-react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/public/PublicLayout";
import { editorialItems, tools } from "@/content/catalog";

export default function Home() {
  const featuredTools = tools.slice(0, 3);
  const featuredItems = editorialItems.slice(0, 3);

  return <PublicLayout>
    <section className="home-hero">
      <div className="site-container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> منصة عربية مستقلة</span>
          <h1>من السؤال اليومي<br />إلى <em>خطوة واضحة</em>.</h1>
          <p>Alshafra تجمع الأدوات العملية والمواعيد المفهومة والأدلة الأصلية في تجربة عربية هادئة تساعدك على الوصول إلى ما تحتاجه ثم اكتشاف ما يفيدك بعده.</p>
          <div className="hero-actions"><Link href="/tools" className="button-primary">استكشف الأدوات <ArrowLeft size={18} /></Link><Link href="/calendar" className="button-secondary">التقويم والمواعيد</Link></div>
          <div className="hero-trust"><CheckCircle2 size={17} /><span>لا أقسام فارغة. لا معلومات بلا سياق. لا هوية موروثة.</span></div>
        </div>
        <div className="hero-panel">
          <div className="panel-top"><span>ابدأ من هنا</span><span className="live-dot">محتوى عملي</span></div>
          <div className="quick-path"><span className="path-icon"><CalendarDays size={21} /></span><div><small>أحتاج إلى</small><strong>تحويل تاريخ أو معرفة فرق بين تاريخين</strong></div><Link href="/tools/date-converter" aria-label="فتح محول التاريخ"><ArrowLeft size={18} /></Link></div>
          <div className="quick-path"><span className="path-icon warm"><Wrench size={21} /></span><div><small>أحتاج إلى</small><strong>حساب عمر أو نسبة مئوية بسرعة</strong></div><Link href="/tools" aria-label="فتح الأدوات"><ArrowLeft size={18} /></Link></div>
          <div className="quick-path"><span className="path-icon blue"><BookOpenText size={21} /></span><div><small>أريد أن</small><strong>أفهم السياق قبل اتخاذ خطوة</strong></div><Link href="/guides" aria-label="فتح الأدلة"><ArrowLeft size={18} /></Link></div>
          <div className="panel-foot"><Compass size={17} />كل مسار يقود إلى معلومة أو أداة ذات صلة.</div>
        </div>
      </div>
    </section>
    <section className="section discovery-section"><div className="site-container"><div className="section-heading"><div><span className="section-kicker">ابدأ بمهمة</span><h2>أدوات خفيفة، نتائج واضحة</h2></div><Link href="/tools" className="text-link">كل الأدوات <ArrowLeft size={17} /></Link></div><div className="feature-tool-grid">{featuredTools.map((tool, index) => <article className="feature-tool" key={tool.id}><span>0{index + 1}</span><h3>{tool.title}</h3><p>{tool.summary}</p><Link href={`/tools/${tool.slug}`}>استخدم الأداة <ArrowLeft size={17} /></Link></article>)}</div></div></section>
    <section className="section section-tint"><div className="site-container calendar-callout"><div><span className="section-kicker">قسم قوي داخل المنصة</span><h2>التقويم والمواعيد، من دون ادعاء أو غموض</h2><p>نفرّق بين الموعد الرسمي والمعلومة الإرشادية والحسابية، ونُظهر المصدر ووقت المراجعة عندما يكون ذلك ضروريًا لاستخدام المعلومة.</p><Link href="/calendar" className="button-dark">استكشف قسم المواعيد <ArrowLeft size={18} /></Link></div><div className="calendar-callout-card"><CalendarDays size={31} /><div><strong>المعلومة لها حالة</strong><span>رسمي · إرشادي · محسوب</span></div><Search size={24} /></div></div></section>
    <section className="section"><div className="site-container"><div className="section-heading"><div><span className="section-kicker">اقرأ لفهم الخطوة التالية</span><h2>أدلة ومقالات من قلب الاستخدام</h2></div><Link href="/guides" className="text-link">كل الأدلة <ArrowLeft size={17} /></Link></div><div className="editorial-grid">{featuredItems.map((item) => <article className="editorial-card" key={item.slug}><div><span className="card-label">{item.topic}</span><h3>{item.title}</h3><p>{item.excerpt}</p></div><footer><span>{item.readingTime}</span><Link href={`/${item.type === "guide" ? "guides" : "articles"}/${item.slug}`} className="text-link">اقرأ الآن <ArrowLeft size={17} /></Link></footer></article>)}</div></div></section>
    <section className="section section-end"><div className="site-container end-cta"><div><span className="section-kicker">اكتشف ما يفيدك</span><h2>ابحث بلغة طبيعية، ثم انتقل إلى الخطوة التالية.</h2></div><Link href="/search" className="button-primary"><Search size={18} />البحث في Alshafra</Link></div></section>
  </PublicLayout>;
}
