import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "wouter";
import { PublicLayout } from "@/components/public/PublicLayout";

export default function NotFound() {
  return <PublicLayout><section className="empty-page site-container"><span className="eyebrow"><Compass size={16} /> 404</span><h1>لم نجد الصفحة التي تبحث عنها</h1><p>قد يكون الرابط غير صحيح أو أن الصفحة لم تُنشر. ابدأ من الأدوات أو التقويم والمواعيد أو ابحث في المحتوى المتاح.</p><div className="hero-actions"><Link href="/" className="button-primary">العودة إلى الرئيسية <ArrowLeft size={18} /></Link><Link href="/search" className="button-secondary">البحث في Alshafra</Link></div></section></PublicLayout>;
}
