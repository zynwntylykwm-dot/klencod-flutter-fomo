import type { Metadata } from "next";
import Link from "next/link";
import { Gavel } from "lucide-react";

import { Badge, EmptyState, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { getUserBids, getUserDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "سجل المزايدات" };

export default async function BidsHistoryPage() {
  const user = await requireUser("/dashboard/bids");
  const [bids, data] = await Promise.all([getUserBids(user.id), getUserDashboard(user.id)]);

  const statusFor = (bid: (typeof bids)[number]) => {
    if (bid.status === "sold") {
      return bid.winnerId === user.id ? { label: "فزت بالمزاد", tone: "gold" } : { label: "لم تفز", tone: "neutral" };
    }
    if (bid.status === "live") {
      return bid.currentBid === bid.amount ? { label: "متصدر", tone: "success" } : { label: "تم تجاوزك", tone: "danger" };
    }
    return { label: "مغلق", tone: "neutral" };
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="إجمالي المزايدات" value={formatNumber(bids.length)} icon={<Gavel className="size-4" />} />
        <StatCard label="متصدر حاليًا" value={formatNumber(data.stats.leading)} hint="مزايدات لا تزال الأعلى" />
        <StatCard label="قيمة أعلى مزايدة" value={formatMoney(bids.reduce((max, bid) => Math.max(max, bid.amount), 0))} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h1 className="text-sm font-extrabold text-ink-950">سجل المزايدات الكامل</h1>
          <span className="text-[10px] text-ink-600">آخر {bids.length} مزايدة · مرتّبة من الأحدث</span>
        </div>
        {bids.length === 0 ? (
          <div className="p-4">
            <EmptyState title="لا مزايدات مسجلة" description="ابدأ بالمزايدة على أحد اللوتات المباشرة ليظهر هنا سجل كامل بالمبالغ والأوقات." action={<Link href="/auctions/live" className="btn btn-ink text-xs">تصفّح المزادات</Link>} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-cream-50 text-[10px] text-ink-600">
                <tr>
                  <th className="px-3 py-2 text-start font-bold">السيارة</th>
                  <th className="px-3 py-2 text-start font-bold">رقم اللوت</th>
                  <th className="px-3 py-2 text-start font-bold">مبلغ مزايدتك</th>
                  <th className="px-3 py-2 text-start font-bold">أعلى مزايدة</th>
                  <th className="px-3 py-2 text-start font-bold">وقت المزايدة</th>
                  <th className="px-3 py-2 text-start font-bold">النتيجة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bids.map((bid) => {
                  const status = statusFor(bid);
                  return (
                    <tr key={bid.id} className="hover:bg-cream-50">
                      <td className="px-3 py-2">
                        <Link href={`/vehicles/${bid.vehicleId}`} className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bid.images?.[0] ?? "/images/hero-yard.jpg"} alt="" className="size-9 rounded object-cover" loading="lazy" />
                          <span className="font-bold text-ink-950">{bid.year} {bid.make} {bid.model}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-ink-600" dir="ltr">{bid.lotNumber}</td>
                      <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(bid.amount)}</td>
                      <td className="px-3 py-2 text-ink-700">{formatMoney(bid.currentBid)}</td>
                      <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(bid.createdAt)}</td>
                      <td className="px-3 py-2"><Badge tone={status.tone}>{status.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="rounded-lg border border-line bg-white px-3 py-2 text-[10px] leading-5 text-ink-600">
        ملاحظة: تُحفظ كل مزايدة في قاعدة البيانات مع الوقت والمبلغ. عند إغلاق المزاد يحدد الخادم الفائز ويصدر فاتورته تلقائيًا،
        وتظهر النتيجة هنا مباشرة. لا يمكن تعديل السجل من الواجهة.
      </p>
    </div>
  );
}
