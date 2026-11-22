import Link from "next/link";
import { ArrowLeft, Bell, CreditCard, Gavel, Heart, Trophy, TrendingUp } from "lucide-react";

import { NotificationsReadButton } from "@/components/notifications-read-button";
import { Badge, EmptyState, StatCard } from "@/components/ui";
import { VehicleCard } from "@/components/vehicle-card";
import { requireUser } from "@/lib/auth";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { getUserDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const data = await getUserDashboard(user.id);

  const byVehicle = new Map<number, (typeof data.bids)[number]>();
  for (const bid of data.bids) {
    const current = byVehicle.get(bid.vehicleId);
    if (!current || bid.amount > current.amount) byVehicle.set(bid.vehicleId, bid);
  }
  const active = Array.from(byVehicle.values()).filter((bid) => bid.status === "live");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="مزايداتك المسجلة" value={formatNumber(data.stats.totalBids)} hint={`على ${data.stats.lotsBid} لوت`} icon={<Gavel className="size-4" />} />
        <StatCard label="متصدر حاليًا" value={formatNumber(data.stats.leading)} hint="مزايدة أنت الأعلى فيها الآن" icon={<TrendingUp className="size-4" />} />
        <StatCard label="مرات الفوز" value={formatNumber(data.wins.length)} hint="تُسوّى تلقائيًا عند انتهاء المزاد" icon={<Trophy className="size-4" />} />
        <StatCard label="المفضلة" value={formatNumber(data.watchCount)} hint="لوتات تتابعها" icon={<Heart className="size-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="text-sm font-extrabold text-ink-950">مزايداتك الجارية</h2>
            <Link href="/dashboard/bids" className="flex items-center gap-1 text-[11px] font-bold text-petrol-500">السجل الكامل <ArrowLeft className="size-3.5" /></Link>
          </div>
          {active.length === 0 ? (
            <div className="p-4">
              <EmptyState title="لا مزايدات جارية" description="زايد على أحد اللوتات المباشرة لتظهر هنا حالة مزايدتك أولًا بأول." action={<Link href="/auctions/live" className="btn btn-ink text-xs">المزادات المباشرة</Link>} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-cream-50 text-[10px] text-ink-600">
                  <tr>
                    <th className="px-3 py-2 text-start font-bold">اللوت</th>
                    <th className="px-3 py-2 text-start font-bold">مزايدتك</th>
                    <th className="px-3 py-2 text-start font-bold">أعلى مزايدة</th>
                    <th className="px-3 py-2 text-start font-bold">الحالة</th>
                    <th className="px-3 py-2 text-start font-bold">ينتهي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {active.map((bid) => {
                    const leading = bid.currentBid === bid.amount;
                    return (
                      <tr key={bid.vehicleId} className="hover:bg-cream-50">
                        <td className="px-3 py-2">
                          <Link href={`/vehicles/${bid.vehicleId}`} className="font-bold text-ink-950 hover:text-petrol-500">
                            {bid.year} {bid.make} {bid.model}
                            <span className="ms-1 block font-mono text-[10px] font-normal text-ink-600" dir="ltr">#{bid.lotNumber}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(bid.amount)}</td>
                        <td className="px-3 py-2 text-ink-700">{formatMoney(bid.currentBid)}</td>
                        <td className="px-3 py-2"><Badge tone={leading ? "success" : "danger"}>{leading ? "متصدر" : "متجاوز"}</Badge></td>
                        <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(bid.auctionEnd)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-ink-950">الفواتير</h2>
              <Link href="/dashboard/payments" className="text-[11px] font-bold text-petrol-500">إدارة المدفوعات</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-success/10 px-2.5 py-2">
                <p className="text-[10px] text-ink-600">مدفوع</p>
                <p className="text-sm font-extrabold text-success">{formatMoney(data.stats.paidTotal)}</p>
              </div>
              <div className="rounded-lg bg-danger/10 px-2.5 py-2">
                <p className="text-[10px] text-ink-600">مستحق</p>
                <p className="text-sm font-extrabold text-danger">{formatMoney(data.stats.dueTotal)}</p>
              </div>
            </div>
            {data.invoices.length === 0 ? (
              <p className="mt-3 rounded-md bg-cream-100 px-3 py-4 text-center text-[11px] text-ink-600">لا توجد فواتير بعد. تُصدر الفاتورة تلقائيًا عند فوزك بمزاد.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line text-[11px]">
                {data.invoices.slice(0, 4).map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-950">{invoice.vehicleLabel}</p>
                      <p className="font-mono text-[10px] text-ink-600" dir="ltr">{invoice.number}</p>
                    </div>
                    <div className="text-end">
                      <p className="font-extrabold text-ink-950">{formatMoney(invoice.total)}</p>
                      <Badge tone={invoice.status === "paid" ? "success" : "danger"}>{INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Bell className="size-4 text-petrol-500" /> الإشعارات</h2>
              <NotificationsReadButton />
            </div>
            <ul className="mt-2 divide-y divide-line">
              {data.notifications.length === 0 ? (
                <li className="py-4 text-center text-[11px] text-ink-600">لا إشعارات حالية.</li>
              ) : (
                data.notifications.slice(0, 4).map((notification) => (
                  <li key={notification.id} className="py-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-extrabold text-ink-950">{notification.title}</p>
                      {!notification.readAt ? <span className="mt-1 size-1.5 shrink-0 rounded-full bg-danger" /> : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-5 text-ink-600">{notification.body}</p>
                    {notification.link ? (
                      <Link href={notification.link} className="text-[10px] font-bold text-petrol-500">عرض التفاصيل ←</Link>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>

      {data.wins.length > 0 ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Trophy className="size-4 text-gold-500" /> سيارات فزت بها</h2>
            <Link href="/dashboard/payments" className="flex items-center gap-1 text-[11px] font-bold text-petrol-500"><CreditCard className="size-3.5" /> الفواتير</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.wins.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} watched={false} showWatch={false} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
