import Link from "next/link";
import { Bell, CreditCard, Gauge, Gavel, Heart, Settings, ShieldCheck, User } from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/auth";
import { getUnreadNotificationCount, getUserDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  const [unread, data] = await Promise.all([getUnreadNotificationCount(user.id), getUserDashboard(user.id)]);

  const items = [
    { label: "نظرة عامة", href: "/dashboard" },
    { label: "سجل المزايدات", href: "/dashboard/bids", badge: data.stats.totalBids },
    { label: "المدفوعات والفواتير", href: "/dashboard/payments", badge: data.invoices.filter((invoice) => invoice.status !== "paid").length },
    { label: "الإشعارات", href: "/dashboard/notifications", badge: unread },
    { label: "المفضلة", href: "/watchlist", badge: data.watchCount },
    { label: "الملف الشخصي", href: "/profile" },
    { label: "إعدادات الحساب", href: "/dashboard/settings" },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 lg:grid-cols-[250px_1fr]">
      <aside className="space-y-3 lg:sticky lg:top-32 lg:self-start">
        <div className="card p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-ink-900 text-sm font-extrabold text-gold-300">
              {user.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-extrabold text-ink-950">{user.name}</p>
              <p className="truncate text-[10px] text-ink-600" dir="ltr">{user.bidderNumber}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-center">
            <div className="rounded-md bg-cream-100 px-1 py-1.5">
              <p className="text-sm font-extrabold text-ink-950">{data.stats.lotsBid}</p>
              <p className="text-[9px] text-ink-600">لوت مزايدة</p>
            </div>
            <div className="rounded-md bg-cream-100 px-1 py-1.5">
              <p className="text-sm font-extrabold text-ink-950">{data.wins.length}</p>
              <p className="text-[9px] text-ink-600">فوز</p>
            </div>
          </div>
        </div>
        <div className="card p-2.5">
          <DashboardNav items={items} />
        </div>
        <div className="card space-y-1 p-2.5 text-[11px]">
          <Link href="/watchlist" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-ink-700 hover:bg-cream-100">
            <Heart className="size-3.5 text-petrol-500" /> المفضلة ({data.watchCount})
          </Link>
          <Link href="/dashboard/payments" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-ink-700 hover:bg-cream-100">
            <CreditCard className="size-3.5 text-petrol-500" /> الفواتير
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-ink-700 hover:bg-cream-100">
            <Settings className="size-3.5 text-petrol-500" /> الإعدادات
          </Link>
          {user.role === "admin" ? (
            <Link href="/admin" className="flex items-center gap-2 rounded-md bg-gold-500/10 px-2 py-1.5 font-bold text-[#8a6413]">
              <ShieldCheck className="size-3.5" /> لوحة الإدارة
            </Link>
          ) : null}
        </div>
      </aside>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3">
          <div>
            <p className="text-[10px] text-ink-600">لوحة تحكم المزايد</p>
            <h1 className="text-base font-extrabold text-ink-950">مرحبًا، {user.name}</h1>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 font-bold text-ink-700"><Bell className="size-3.5 text-petrol-500" /> {unread} إشعار غير مقروء</span>
            <Link href="/auctions/live" className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 font-bold text-success"><Gauge className="size-3.5" /> مزاد مباشر</Link>
            <Link href="/vehicles" className="flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 font-bold text-white"><Gavel className="size-3.5" /> زايد الآن</Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
