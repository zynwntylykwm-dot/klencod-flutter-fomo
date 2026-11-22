import { InvoiceManager, SettingsManager } from "@/components/admin/managers";
import { getAdminInvoices, getAdminWinners } from "@/lib/admin-queries";
import { getPlatformSettings } from "@/lib/queries";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [invoices, settings, winners] = await Promise.all([getAdminInvoices(), getPlatformSettings(), getAdminWinners()]);
  return (
    <div className="space-y-4">
      <InvoiceManager invoices={invoices} />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Trophy className="size-4 text-gold-500" /> إدارة الفائزين ({winners.length})</h2>
          <span className="text-[10px] text-ink-600">يُحدد الفائز تلقائيًا عند إغلاق المزاد ويصدر فاتورته</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-cream-50 text-[10px] text-ink-600">
              <tr>
                <th className="px-3 py-2 text-start font-bold">اللوت</th>
                <th className="px-3 py-2 text-start font-bold">السيارة</th>
                <th className="px-3 py-2 text-start font-bold">الفائز</th>
                <th className="px-3 py-2 text-start font-bold">سعر الفوز</th>
                <th className="px-3 py-2 text-start font-bold">الفاتورة</th>
                <th className="px-3 py-2 text-start font-bold">تاريخ الإغلاق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {winners.map((winner) => (
                <tr key={winner.vehicleId} className="hover:bg-cream-50">
                  <td className="px-3 py-2 font-mono text-[10px]" dir="ltr">{winner.lotNumber}</td>
                  <td className="px-3 py-2 font-bold text-ink-950">{winner.vehicleLabel}</td>
                  <td className="px-3 py-2">
                    <p className="font-bold text-ink-900">{winner.winnerName ?? "—"}</p>
                    <p className="text-[10px] text-ink-600" dir="ltr">{winner.winnerEmail ?? ""}</p>
                  </td>
                  <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(winner.winningBid ?? 0)}</td>
                  <td className="px-3 py-2">
                    <p className="font-mono text-[10px]" dir="ltr">{winner.invoiceNumber ?? "بدون فاتورة"}</p>
                    <p className="text-[10px] text-ink-600">{winner.invoiceStatus ? INVOICE_STATUS_LABELS[winner.invoiceStatus] ?? winner.invoiceStatus : "—"} · {formatMoney(winner.invoiceTotal ?? 0)}</p>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(winner.settledAt)}</td>
                </tr>
              ))}
              {winners.length === 0 ? <tr><td colSpan={6} className="px-3 py-6 text-center text-ink-600">لا فائزين بعد.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <SettingsManager
          settings={{
            buyerFeePercent: settings.buyerFeePercent,
            minBuyerFee: settings.minBuyerFee,
            docFee: settings.docFee,
            sellerCommissionPercent: settings.sellerCommissionPercent,
            defaultIncrement: settings.defaultIncrement,
            paymentDueDays: settings.paymentDueDays,
          }}
        />
        <div className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">دورة الفوترة في المنصة</h2>
          <ol className="mt-2 space-y-2 text-[11px] leading-6 text-ink-700">
            <li><span className="font-bold text-ink-950">١. إغلاق المزاد:</span> يحدد الخادم أعلى مزايدة ويغلق اللوت تلقائيًا عند انتهاء العدّاد.</li>
            <li><span className="font-bold text-ink-950">٢. التحقق من الاحتياطي:</span> إن لم يستوفِ أعلى مزايدة السعر الاحتياطي يُغلق اللوت دون بيع.</li>
            <li><span className="font-bold text-ink-950">٣. إصدار الفاتورة:</span> سعر البيع + عمولة المشتري (بحد أدنى) + رسوم المستندات + الشحن التقديري.</li>
            <li><span className="font-bold text-ink-950">٤. الإشعار:</span> يستلم الفائز إشعار فوز وفاتورة في لوحة التحكم.</li>
            <li><span className="font-bold text-ink-950">٥. التحصيل:</span> يسدّد المزايد من صفحة المدفوعات، وتُحدَّث حالة الفاتورة للطرفين.</li>
          </ol>
          <p className="mt-3 rounded-md bg-cream-100 px-2.5 py-2 text-[10px] leading-5 text-ink-600">
            المدفوعات هنا محاكاة كاملة لدورة الفوترة على قاعدة بيانات حقيقية. لربط بوابة دفع فعلية لاحقًا، أضف مزود الخدمة في
            مسار <span className="font-mono" dir="ltr">/api/invoices/[id]/pay</span> دون تغيير الواجهة.
          </p>
        </div>
      </div>
    </div>
  );
}
