import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/logo";
import { BRAND } from "@/lib/constants";

const columns = [
  {
    title: "تصفّح المنصة",
    links: [
      { label: "جميع السيارات", href: "/vehicles" },
      { label: "المزادات المباشرة", href: "/auctions/live" },
      { label: "المزادات القادمة", href: "/auctions/upcoming" },
      { label: "السيارات المباعة", href: "/sold" },
    ],
  },
  {
    title: "حسابي",
    links: [
      { label: "لوحة التحكم", href: "/dashboard" },
      { label: "سجل المزايدات", href: "/dashboard/bids" },
      { label: "المدفوعات والفواتير", href: "/dashboard/payments" },
      { label: "المفضلة", href: "/watchlist" },
    ],
  },
  {
    title: "المنصة",
    links: [
      { label: "كيف يعمل المزاد", href: "/how-it-works" },
      { label: "إنشاء حساب", href: "/register" },
      { label: "تسجيل الدخول", href: "/login" },
      { label: "إعدادات الحساب", href: "/dashboard/settings" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink-950 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white/5 p-3 inline-block">
            <Logo variant="dark" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-cream-200/80">
            منصة مستقلة لمزادات السيارات تربط البائعين المرخّصين بالمزايدين حول العالم، مع شفافية كاملة في سجل المزايدات
            والفواتير والعمولات.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-cream-200/80">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-gold-400" /> <span dir="ltr">{BRAND.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-gold-400" /> <span dir="ltr">{BRAND.email}</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-gold-400" /> ساحة دالاس الرئيسية — تكساس، الولايات المتحدة
            </li>
          </ul>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-bold text-white">{column.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-cream-200/75 transition hover:text-gold-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-cream-200/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.fullEn}. جميع الحقوق محفوظة. منصة بهوية مستقلة وغير تابعة لأي مزاد آخر.
          </p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-gold-400" />
            نسخة تجريبية (Demo) — بيانات اللوتات والمزايدات محفوظة على الخادم وتُدار لأغراض العرض.
          </p>
        </div>
      </div>
    </footer>
  );
}
