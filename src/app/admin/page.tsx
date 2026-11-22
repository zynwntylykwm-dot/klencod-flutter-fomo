import Link from "next/link";
import { ArrowLeft, BadgeDollarSign, Bell, Car, Gavel, Receipt, TrendingUp, Users } from "lucide-react";

import { StatCard } from "@/components/ui";
import { getAdminOverview } from "@/lib/admin-queries";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { stats, recentBids, recentUsers } = await getAdminOverview();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المستخدمون" value={formatNumber(stats.users)} icon={<Users className="size-4" />} hint="حسابات المزايدين النشطة" />
        <StatCard label="لوتات مباشرة" value={formatNumber(stats.live)} icon={<Car className="size-4" />} hint="تقبل المزايدة الآن" />
        <StatCard label="سيارات مباعة" value={formatNumber(stats.sold)} icon={<BadgeDollarSign className="size-4" />} hint="فواتير صادرة تلقائيًا" />
        <StatCard label="إجمالي المزايدات" value={formatNumber(stats.bids)} icon={<Gavel className="size-4" />} hint={`حجم ${formatMoney(stats.volume)}`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المبالغ المحصلة" value={formatMoney(stats.collected)} icon={<Receipt className="size-4" />} hint="فواتير مدفوعة" />
        <StatCard label="عمولات ورسوم" value={formatMoney(stats.fees)} icon={<TrendingUp className="size-4" />} hint="إيراد المنصة من الفواتير المدفوعة" />
        <StatCard label="فواتير معلّقة" value={formatNumber(stats.pendingInvoices)} icon={<Bell className="size-4" />} hint="تحتاج متابعة تحصيل" />
        <StatCard label="متوسط المزايدة" value={formatMoney(stats.bids ? Math.round(stats.volume / stats.bids) : 0)} hint="حسب جميع المزايدات المسجلة" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="text-sm font-extrabold text-ink-950">أحدث المزايدات</h2>
            <Link href="/admin/bids" className="flex items-center gap-1 text-[11px] font-bold text-petrol-500">كل المزايدات <ArrowLeft className="size-3.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-cream-50 text-[10px] text-ink-600">
                <tr>
                  <th className="px-3 py-2 text-start font-bold">المزايد</th>
                  <th className="px-3 py-2 text-start font-bold">اللوت</th>
                  <th className="px-3 py-2 text-start font-bold">المبلغ</th>
                  <th className="px-3 py-2 text-start font-bold">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-cream-50">
                    <td className="px-3 py-2 font-bold text-ink-950">{bid.bidderName}</td>
                    <td className="px-3 py-2">
                      <Link href={`/vehicles/${bid.vehicleId}`} className="text-ink-700 hover:text-petrol-500">
                        {bid.year} {bid.make} {bid.model}
                        <span className="ms-1 font-mono text-[10px] text-ink-600" dir="ltr">#{bid.lotNumber}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(bid.amount)}</td>
                    <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(bid.createdAt)}</td>
                  </tr>
                ))}
                {recentBids.length === 0 ? (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-600">لا مزايدات بعد.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-ink-950">أحدث المستخدمين</h2>
              <Link href="/admin/users" className="text-[11px] font-bold text-petrol-500">إدارة</Link>
            </div>
            <ul className="mt-2 divide-y divide-line text-[11px]">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-950">{user.name}</p>
                    <p className="truncate text-[10px] text-ink-600" dir="ltr">{user.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${user.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {user.status === "active" ? "نشط" : "موقوف"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-4">
            <h2 className="text-sm font-extrabold text-ink-950">مهام إدارية</h2>
            <div className="mt-2 grid gap-2">
              {[
                { label: "إضافة سيارة جديدة للكتالوج", href: "/admin/vehicles" },
                { label: "جدولة مزاد وتحديد المواعيد", href: "/admin/auctions" },
                { label: "مراجعة الفواتير والعمولات", href: "/admin/payments" },
                { label: "إرسال إشعار للمزايدين", href: "/admin/notifications" },
              ].map((task) => (
                <Link key={task.href + task.label} href={task.href} className="flex items-center justify-between rounded-md bg-cream-100 px-2.5 py-2 text-[11px] font-bold text-ink-800 hover:bg-cream-200">
                  {task.label} <ArrowLeft className="size-3.5" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
