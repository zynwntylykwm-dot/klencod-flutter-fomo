import Link from "next/link";
import { Bell, CreditCard, FileBarChart, Gauge, Gavel, LayoutDashboard, ShieldCheck, Users, Warehouse } from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { FinalizeButton } from "@/components/admin/action-button";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "لوحة الإدارة" };

const items = [
  { label: "نظرة عامة", href: "/admin" },
  { label: "إدارة السيارات", href: "/admin/vehicles" },
  { label: "إدارة المزادات", href: "/admin/auctions" },
  { label: "المستخدمون", href: "/admin/users" },
  { label: "المزايدات", href: "/admin/bids" },
  { label: "المدفوعات والعمولات", href: "/admin/payments" },
  { label: "الإشعارات", href: "/admin/notifications" },
  { label: "التقارير والإحصاءات", href: "/admin/reports" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin("/admin");

  return (
    <div className="min-h-screen bg-cream-100/60">
      <div className="hero-mesh">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-gold-400"><ShieldCheck className="size-3.5" /> لوحة إدارة منصة منارة</p>
            <h1 className="mt-0.5 text-xl font-extrabold text-white">مركز التحكم الكامل</h1>
            <p className="text-[11px] text-cream-200/70">مسجّل الدخول: {admin.name} · {admin.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FinalizeButton />
            <Link href="/" className="btn border border-white/20 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20">الموقع العام</Link>
            <Link href="/dashboard" className="btn btn-gold px-3 py-2 text-xs">لوحة المزايد</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-2.5">
            <DashboardNav items={items} />
          </div>
          <div className="card mt-3 space-y-1.5 p-3 text-[10px] text-ink-600">
            <p className="flex items-center gap-1.5 font-bold text-ink-900"><Warehouse className="size-3.5 text-petrol-500" /> أدوات سريعة</p>
            <Link href="/admin/vehicles" className="flex items-center gap-1.5 hover:text-petrol-500"><Gavel className="size-3" /> إضافة سيارة</Link>
            <Link href="/admin/auctions" className="flex items-center gap-1.5 hover:text-petrol-500"><Gauge className="size-3" /> جدولة مزاد</Link>
            <Link href="/admin/payments" className="flex items-center gap-1.5 hover:text-petrol-500"><CreditCard className="size-3" /> مراجعة الفواتير</Link>
            <Link href="/admin/notifications" className="flex items-center gap-1.5 hover:text-petrol-500"><Bell className="size-3" /> إرسال إشعار</Link>
            <Link href="/admin/reports" className="flex items-center gap-1.5 hover:text-petrol-500"><FileBarChart className="size-3" /> التقارير</Link>
            <Link href="/admin/users" className="flex items-center gap-1.5 hover:text-petrol-500"><Users className="size-3" /> الصلاحيات</Link>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
