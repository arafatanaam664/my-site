import { ArrowLeft, BookOpenText } from "lucide-react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { editorialItems } from "@/content/catalog";

export default function EditorialList({ type }: { type: "guide" | "article" }) {
  const isGuide = type === "guide";
  const items = editorialItems.filter((item) => item.type === type);
  const base = isGuide ? "/guides" : "/articles";
  const label = isGuide ? "الأدلة" : "المقالات";
  return <PublicLayout><section className="page-hero soft"><div className="site-container"><Breadcrumbs items={[{ label }]} /><div className="hero-copy compact"><span className="eyebrow"><BookOpenText size={16} /> {label}</span><h1>{isGuide ? "أدلة تشرح ما وراء النتيجة" : "مقالات عملية تبدأ من السؤال الحقيقي"}</h1><p>{isGuide ? "تنتقل الأدلة من الأداة أو الموعد إلى الاستثناءات والخطوات والمصادر التي تجعل المعلومة قابلة للاستخدام." : "محتوى تحريري موجز يساعدك على قراءة المعلومة أو الحساب أو الموعد في سياقه."}</p></div></div></section><section className="section"><div className="site-container editorial-grid">{items.map((item) => <article className="editorial-card" key={item.slug}><div><span className="card-label">{item.topic}</span><h2>{item.title}</h2><p>{item.excerpt}</p></div><footer><span>{item.readingTime}</span><Link href={`${base}/${item.slug}`} className="text-link">اقرأ {isGuide ? "الدليل" : "المقال"}<ArrowLeft size={17} /></Link></footer></article>)}</div></section></PublicLayout>;
}
