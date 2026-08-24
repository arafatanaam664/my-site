import { ArrowLeft, Compass, Menu, Search, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/tools", label: "الأدوات" },
  { href: "/calendar", label: "التقويم والمواعيد" },
  { href: "/guides", label: "الأدلة" },
  { href: "/articles", label: "المقالات" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="site-shell" dir="rtl">
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="/" className="brand" aria-label="Alshafra الرئيسية">
            <span className="brand-mark" aria-hidden="true"><Sparkles size={18} strokeWidth={2.4} /></span>
            <span>
              <strong>Alshafra</strong>
              <small>معرفة عملية، بخطوة واضحة</small>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={location === item.href ? "nav-link active" : "nav-link"}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/search" className="header-search" aria-label="البحث في المنصة">
            <Search size={18} />
            <span>ابحث</span>
          </Link>
          <button className="mobile-menu" type="button" aria-label="فتح القائمة" onClick={() => document.getElementById("mobile-nav")?.classList.toggle("open")}>
            <Menu size={22} />
          </button>
        </div>
        <nav id="mobile-nav" className="mobile-nav" aria-label="التنقل عبر الهاتف">
          {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}<ArrowLeft size={16} /></Link>)}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <div className="footer-brand"><span className="brand-mark" aria-hidden="true"><Sparkles size={17} /></span><strong>Alshafra</strong></div>
            <p>منصة عربية مستقلة للأدوات والمواعيد والأدلة التي تساعدك على الانتقال من السؤال إلى خطوة عملية.</p>
          </div>
          <div>
            <h2>استكشف</h2>
            <Link href="/tools">الأدوات العملية</Link>
            <Link href="/calendar">التقويم والمواعيد</Link>
            <Link href="/guides">الأدلة</Link>
          </div>
          <div>
            <h2>المعلومات</h2>
            <Link href="/about">عن Alshafra</Link>
            <Link href="/privacy">الخصوصية</Link>
            <Link href="/terms">الشروط</Link>
            <Link href="/contact">تواصل معنا</Link>
          </div>
          <div className="footer-principle">
            <Compass size={20} />
            <p>نوضح مصدر المعلومة وحالتها ووقت مراجعتها عندما يكون ذلك مهمًا.</p>
          </div>
        </div>
        <div className="site-container footer-bottom">© 2026 Alshafra. لا نقدم خدمة وسيط رسمي، وتبقى الجهة المختصة مرجعًا للقرارات الحساسة.</div>
      </footer>
    </div>
  );
}
