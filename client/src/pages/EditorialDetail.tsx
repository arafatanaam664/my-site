import { ArrowLeft, ExternalLink, FileText, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Breadcrumbs } from "@/components/public/Breadcrumbs";
import { PublicLayout } from "@/components/public/PublicLayout";
import { RelatedContent } from "@/components/public/RelatedContent";
import { findEditorialItem } from "@/content/catalog";

export default function EditorialDetail({ type }: { type: "guide" | "article" }) {
  const [, params] = useRoute<{ slug: string }>(`/${type === "guide" ? "guides" : "articles"}/:slug`);
  const item = findEditorialItem(params?.slug ?? "");
  const label = type === "guide" ? "الأدلة" : "المقالات";
  if (!item || item.type !== type) return <PublicLayout><section className="empty-page site-container"><h1>المحتوى غير موجود</h1><p>ربما لم يُنشر بعد أو تغير الرابط.</p><Link href={`/${type === "guide" ? "guides" : "articles"}`} className="button-primary">العودة إلى {label}</Link></section></PublicLayout>;
  return <PublicLayout><article className="editorial-page"><div className="site-container editorial-container"><Breadcrumbs items={[{ label, href: `/${type === "guide" ? "guides" : "articles"}` }, { label: item.title }]} /><header className="editorial-header"><span className="eyebrow"><FileText size={16} /> {item.topic}</span><h1>{item.title}</h1><p>{item.excerpt}</p><div className="editorial-meta"><span>قراءة {item.readingTime}</span><span>آخر مراجعة: {item.updatedAt}</span><button type="button" className="share-button" onClick={() => navigator.share?.({ title: item.title, url: window.location.href })}><Share2 size={15} />مشاركة</button></div></header><div className="editorial-layout"><div className="article-prose">{item.body.map((section, index) => <section key={index}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}{item.sourceLabel && item.sourceUrl && <aside className="article-source"><span>مصدر للقراءة والتحقق</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceLabel}<ExternalLink size={15} /></a></aside>}</div><RelatedContent toolIds={item.relatedTools} /></div></div></article></PublicLayout>;
}
