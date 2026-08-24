import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumbs" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link>{items.map((item) => <span key={item.label}><ChevronLeft size={14} />{item.href ? <Link href={item.href}>{item.label}</Link> : <strong>{item.label}</strong>}</span>)}</nav>;
}
