import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { editorialItems, tools } from "@/content/catalog";

const normalizeArabic = (value: string) => value.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ً-ْ]/g, "").trim();

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = normalizeArabic(query);
    if (!needle) return [];
    const content = [...tools.map((item) => ({ title: item.title, summary: item.summary, href: `/tools/${item.slug}`, type: "أداة" })), ...editorialItems.map((item) => ({ title: item.title, summary: item.excerpt, href: `/${item.type === "guide" ? "guides" : "articles"}/${item.slug}`, type: item.type === "guide" ? "دليل" : "مقال" }))];
    return content.filter((item) => normalizeArabic(`${item.title} ${item.summary}`).includes(needle));
  }, [query]);
  return <PublicLayout><section className="search-page"><div className="site-container narrow"><Breadcrumbs items={[{ label: "البحث" }]} /><span className="eyebrow"><Search size={16} /> بحث Alshafra</span><h1>ابحث عن أداة أو دليل أو معلومة عملية</h1><div className="search-input"><Search size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثال: تحويل التاريخ أو حساب العمر" autoComplete="off" /></div>{query ? <div className="search-results"><div className="search-result-head"><span>{results.length.toLocaleString("ar-SA")} نتيجة</span><SlidersHorizontal size={18} /></div>{results.length ? results.map((result) => <Link href={result.href} key={result.href} className="search-result"><span>{result.type}</span><strong>{result.title}</strong><p>{result.summary}</p></Link>) : <div className="empty-search">لا توجد نتيجة مطابقة الآن. جرّب كلمة أقصر أو استكشف الأقسام الرئيسية.</div>}</div> : <div className="search-hint">يبحث الإصدار الأول في المحتوى المنشور فقط، ويطبّع بعض اختلافات الكتابة العربية لتسهيل الوصول.</div>}</div></section></PublicLayout>;
}
