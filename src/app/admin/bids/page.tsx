import Link from "next/link";
import { Gavel } from "lucide-react";

import { Badge } from "@/components/ui";
import { getAdminBids } from "@/lib/admin-queries";
import { formatDateTime, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminBidsPage() {
  const bids = await getAdminBids(150);
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h1 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Gavel className="size-4 text-petrol-500" /> مراجعة المزايدات ({bids.length})</h1>
        <span className="text-[10px] text-ink-600">سجل غير قابل للتعديل من الواجهة — مرتب من الأحدث</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-cream-50 text-[10px] text-ink-600">
            <tr>
              <th className="px-3 py-2 text-start font-bold">#</th>
              <th className="px-3 py-2 text-start font-bold">المزايد</th>
              <th className="px-3 py-2 text-start font-bold">السيارة</th>
              <th className="px-3 py-2 text-start font-bold">المبلغ</th>
              <th className="px-3 py-2 text-start font-bold">وقت المزايدة</th>
              <th className="px-3 py-2 text-start font-bold">حالة اللوت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {bids.map((bid, index) => (
              <tr key={bid.id} className="hover:bg-cream-50">
                <td className="px-3 py-2 text-ink-600">{index + 1}</td>
                <td className="px-3 py-2">
                  <p className="font-bold text-ink-950">{bid.bidderName}</p>
                  <p className="text-[10px] text-ink-600" dir="ltr">{bid.bidderEmail}</p>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/vehicles/${bid.vehicleId}`} className="font-bold text-ink-800 hover:text-petrol-500">
                    {bid.year} {bid.make} {bid.model}
                    <span className="ms-1 font-mono text-[10px] font-normal text-ink-600" dir="ltr">#{bid.lotNumber}</span>
                  </Link>
                </td>
                <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(bid.amount)}</td>
                <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(bid.createdAt)}</td>
                <td className="px-3 py-2"><Badge tone={bid.vehicleStatus === "live" ? "live" : bid.vehicleStatus === "sold" ? "sold" : "upcoming"}>{bid.vehicleStatus}</Badge></td>
              </tr>
            ))}
            {bids.length === 0 ? <tr><td colSpan={6} className="px-3 py-8 text-center text-ink-600">لا مزايدات مسجلة.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
