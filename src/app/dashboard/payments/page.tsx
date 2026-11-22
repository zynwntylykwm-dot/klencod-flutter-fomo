import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeDollarSign, CreditCard, FileText, Receipt, ShieldCheck } from "lucide-react";

import { PayButton } from "@/components/pay-button";
import { Badge, EmptyState, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import { getPlatformSettings, getUserInvoices } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "المدفوعات والفواتير" };

export default async function PaymentsPage() {
  const user = await requireUser("/dashboard/payments");
  const [invoices, config] = await Promise.all([getUserInvoices(user.id), getPlatformSettings()]);
  const paid = invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const due = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.total, 0);
  const fees = invoices.reduce((sum, invoice) => sum + invoice.buyerFee + invoice.docFee, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المدفوع" value={formatMoney(paid)} icon={<CreditCard className="size-4" />} hint="سداد مسجّل في حسابك" />
        <StatCard label="مستحقات قائمة" value={formatMoney(due)} icon={<AlertTriangle className="size-4" />} hint={`مهلة السداد ${config.paymentDueDays} أيام`} />
        <StatCard label="العمولات والرسوم" value={formatMoney(fees)} icon={<Receipt className="size-4" />} hint={`عمولة المشتري ${config.buyerFeePercent}%`} />
        <StatCard label="عدد الفواتير" value={invoices.length} icon={<FileText className="size-4" />} />
      </div>

      <div className="rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-[11px] leading-6 text-[#7a5a12]">
        <p className="flex items-center gap-1.5 font-extrabold"><ShieldCheck className="size-4" /> بيئة دفع تجريبية</p>
        <p>زر الدفع يسجّل عملية سداد فعلية في قاعدة البيانات ويحدّث حالة الفاتورة والفواتير الإدارية. لا يتم سحب أي مبالغ حقيقية، والنظام مهيأ لربط بوابة دفع خارجية عبر واجهة الخادم.</p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="لا توجد فواتير بعد"
          description="تُصدر الفاتورة تلقائيًا عند فوزك بأحد اللوتات، وتشمل سعر البيع وعمولة المشتري ورسوم المستندات."
          action={<Link href="/auctions/live" className="btn btn-ink text-xs">تصفّح المزادات المباشرة</Link>}
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-cream-50 px-4 py-2.5">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
                    <BadgeDollarSign className="size-4 text-gold-500" /> {invoice.vehicleLabel}
                    <span className="font-mono text-[10px] font-normal text-ink-600" dir="ltr">LOT #{invoice.lotNumber}</span>
                  </p>
                  <p className="font-mono text-[10px] text-ink-600" dir="ltr">{invoice.number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={invoice.status === "paid" ? "success" : invoice.status === "pending" ? "gold" : "danger"}>
                    {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                  </Badge>
                  <PayButton invoiceId={invoice.id} total={formatMoney(invoice.total)} disabled={invoice.status === "paid"} />
                </div>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-[1.3fr_1fr]">
                <dl className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between"><dt className="text-ink-600">سعر البيع (المطرقة)</dt><dd className="font-bold text-ink-950">{formatMoney(invoice.hammerPrice)}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-ink-600">عمولة المشتري ({config.buyerFeePercent}%)</dt><dd className="font-bold text-ink-950">{formatMoney(invoice.buyerFee)}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-ink-600">رسوم المستندات</dt><dd className="font-bold text-ink-950">{formatMoney(invoice.docFee)}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-ink-600">الشحن التقديري</dt><dd className="font-bold text-ink-950">{formatMoney(invoice.shippingFee)}</dd></div>
                  <div className="flex items-center justify-between border-t border-line pt-1.5"><dt className="font-extrabold text-ink-950">الإجمالي المستحق</dt><dd className="text-sm font-extrabold text-ink-950">{formatMoney(invoice.total)}</dd></div>
                </dl>
                <div className="rounded-lg bg-cream-100 px-3 py-2 text-[10px] leading-5 text-ink-700">
                  <p><span className="font-bold text-ink-950">تاريخ الإصدار:</span> {formatDate(invoice.createdAt)}</p>
                  <p><span className="font-bold text-ink-950">تاريخ الاستحقاق:</span> {formatDate(invoice.dueDate)}</p>
                  <p><span className="font-bold text-ink-950">طريقة الدفع:</span> {invoice.method ?? "لم تُسجّل"}</p>
                  {invoice.paidAt ? <p><span className="font-bold text-ink-950">تاريخ السداد:</span> {formatDate(invoice.paidAt)}</p> : null}
                  {invoice.vehicleId ? <Link href={`/vehicles/${invoice.vehicleId}`} className="mt-1 inline-block font-bold text-petrol-500">عرض اللوت ←</Link> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
