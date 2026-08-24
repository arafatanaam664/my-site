import { ArrowLeft, Calculator, CalendarDays, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { tools } from "@/content/catalog";

export default function Tools() {
  return <PublicLayout><section className="page-hero soft"><div className="site-container"><Breadcrumbs items={[{ label: "الأدوات" }]} /><div className="hero-copy compact"><span className="eyebrow"><Calculator size={16} /> أدوات عملية</span><h1>أدوات تساعدك على إنجاز المهمة، لا مجرد ملء الصفحة</h1><p>ابدأ بالنتيجة التي تحتاجها، ثم استخدم الدليل المرتبط لفهم الاستثناءات والسياق عندما يكون ذلك مهمًا.</p></div></div></section><section className="section"><div className="site-container"><div className="tool-grid">{tools.map((tool, index) => <article className="tool-card" key={tool.id}><span className="tool-number">0{index + 1}</span><div><span className="card-label">{tool.category}</span><h2>{tool.title}</h2><p>{tool.summary}</p></div><Link href={`/tools/${tool.slug}`} className="text-link">استخدم الأداة <ArrowLeft size={17} /></Link></article>)}</div><div className="trust-strip"><CalendarDays size={22} /><p><strong>خصوصيتك أولًا.</strong> تعمل أدوات الإصدار الأول داخل المتصفح ولا تطلب منك إنشاء حساب أو إرسال بيانات شخصية.</p><CheckCircle2 size={22} /></div></div></section></PublicLayout>;
}
