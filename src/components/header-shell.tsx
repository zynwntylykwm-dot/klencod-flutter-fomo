"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Gavel,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { BRAND } from "@/lib/constants";

type HeaderUser = { name: string; email: string; role: string; bidderNumber: string } | null;

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "السيارات", href: "/vehicles" },
  { label: "المزادات المباشرة", href: "/auctions/live" },
  { label: "المزادات القادمة", href: "/auctions/upcoming" },
  { label: "السيارات المباعة", href: "/sold" },
  { label: "كيف يعمل", href: "/how-it-works" },
];

export function HeaderShell({
  user,
  watchCount,
  unread,
}: {
  user: HeaderUser;
  watchCount: number;
  unread: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [term, setTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setMobileOpen(false);
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-ink-950 text-cream-200/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-gold-400" />
              مزادات مرخّصة · مزايدات مسجّلة على الخادم
            </span>
            <Link href="/how-it-works" className="hidden hover:text-gold-400 md:inline">
              كيف يعمل المزاد
            </Link>
            <span className="hidden items-center gap-1 sm:inline" dir="ltr">
              USD $ · AR
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span dir="ltr" className="hidden sm:inline">
              {BRAND.phone}
            </span>
            <span className="hidden text-gold-300 md:inline">ساحة دالاس، تكساس</span>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Logo />
          <form onSubmit={submitSearch} className="hidden flex-1 items-center md:flex" role="search">
            <div className="flex w-full items-center rounded-lg border border-line bg-cream-50 focus-within:border-petrol-400">
              <Search className="mx-3 size-4 shrink-0 text-ink-600" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="ابحث بالشركة، الطراز، سنة الصنع، VIN أو رقم اللوت..."
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-600/70"
                aria-label="بحث"
              />
              <button type="submit" className="btn btn-ink m-1 rounded-md px-4 py-1.5 text-xs">
                بحث
              </button>
            </div>
          </form>

          <div className="ms-auto flex items-center gap-1.5 md:ms-0">
            <Link
              href="/watchlist"
              className="relative hidden size-10 items-center justify-center rounded-lg border border-line text-ink-700 hover:border-ink-700 sm:flex"
              aria-label="المفضلة"
            >
              <Heart className="size-5" />
              {watchCount > 0 ? (
                <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-extrabold text-ink-950">
                  {watchCount}
                </span>
              ) : null}
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-start hover:border-ink-700"
                  aria-expanded={menuOpen}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-ink-900 text-xs font-extrabold text-gold-300">
                    {user.name.slice(0, 1)}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block max-w-28 truncate text-xs font-bold text-ink-950">{user.name}</span>
                    <span className="block text-[10px] text-ink-600">{user.role === "admin" ? "مدير المنصة" : user.bidderNumber}</span>
                  </span>
                  <ChevronDown className="size-4 text-ink-600" />
                  {unread > 0 ? <span className="size-2 rounded-full bg-danger" /> : null}
                </button>
                {menuOpen ? (
                  <div className="absolute end-0 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-xl">
                    <div className="border-b border-line px-3 py-2">
                      <p className="text-sm font-extrabold text-ink-950">{user.name}</p>
                      <p dir="ltr" className="truncate text-[11px] text-ink-600">{user.email}</p>
                    </div>
                    {[
                      { label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
                      { label: "الملف الشخصي", href: "/profile", icon: UserIcon },
                      { label: "سجل المزايدات", href: "/dashboard/bids", icon: Gavel },
                      { label: "المفضلة", href: "/watchlist", icon: Heart },
                      { label: "المدفوعات والفواتير", href: "/dashboard/payments", icon: Bell },
                      { label: "إعدادات الحساب", href: "/dashboard/settings", icon: Settings },
                    ].map((item) => (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink-800 hover:bg-cream-100"
                      >
                        <item.icon className="size-4 text-petrol-500" />
                        {item.label}
                      </Link>
                    ))}
                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 border-t border-line px-3 py-2 text-sm font-bold text-[#8a6413] hover:bg-gold-500/10"
                      >
                        <ShieldCheck className="size-4" /> لوحة الإدارة
                      </Link>
                    ) : null}
                    <form action="/api/auth/logout" method="post" className="border-t border-line">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-bold text-danger hover:bg-danger/5"
                      >
                        <LogOut className="size-4" /> تسجيل الخروج
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn btn-outline px-3 py-2 text-xs">
                  دخول
                </Link>
                <Link href="/register" className="btn btn-gold px-3 py-2 text-xs">
                  إنشاء حساب
                </Link>
              </div>
            )}

            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg border border-line text-ink-800 md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-line bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative whitespace-nowrap px-3 py-3 text-sm font-bold transition ${
                  isActive(item.href) ? "text-ink-950" : "text-ink-600 hover:text-ink-950"
                }`}
              >
                {item.label}
                {isActive(item.href) ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded bg-gold-500" /> : null}
              </Link>
            ))}
          </nav>
          <Link
            href="/auctions/live"
            className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-extrabold text-success"
          >
            <span className="live-dot inline-block size-1.5 rounded-full bg-success" /> مزاد مباشر الآن
          </Link>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-b border-line bg-white shadow-lg md:hidden">
          <div className="space-y-3 px-4 py-4">
            <form onSubmit={submitSearch} className="flex items-center rounded-lg border border-line bg-cream-50">
              <Search className="mx-3 size-4 text-ink-600" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="ابحث عن سيارة أو لوت..."
                className="w-full bg-transparent py-2.5 text-sm outline-none"
                aria-label="بحث"
              />
            </form>
            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${
                    isActive(item.href) ? "bg-ink-900 text-white" : "bg-cream-100 text-ink-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 border-t border-line pt-3">
              <Link href="/watchlist" className="btn btn-outline justify-start text-xs">
                <Heart className="size-4" /> المفضلة ({watchCount})
              </Link>
              <Link href={user ? "/dashboard" : "/login"} className="btn btn-outline justify-start text-xs">
                <LayoutDashboard className="size-4" /> {user ? "لوحة التحكم" : "تسجيل الدخول"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
