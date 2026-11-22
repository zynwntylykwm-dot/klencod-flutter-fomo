import { FileBarChart, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/ui";
import { getAdminReport, getAdminOverview } from "@/lib/admin-queries";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

function Bars({ rows }: { rows: { label: string; value: number; hint?: string }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="mt-3 space-y-2.5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-bold text-ink-900">{row.label}</span>
            <span className="text-ink-600">{row.hint ?? formatNumber(row.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
            <div className="h-full rounded-full bg-petrol-500" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
      {rows.length === 0 ? <p className="text-[11px] text-ink-600">لا بيانات كافية.</p> : null}
    </div>
  );
}

export default async function AdminReportsPage() {
  const [report, overview] = await Promise.all([getAdminReport(), getAdminOverview()]);
  const totals = report.totals;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي اللوتات" value={formatNumber(totals.lots)} hint="في جميع مزادات المنصة" icon={<FileBarChart className="size-4" />} />
        <StatCard label="لوتات مباعة" value={formatNumber(totals.sold)} hint={`${formatNumber(totals.live)} مباشرة الآن`} />
        <StatCard label="متوسط سعر البيع" value={formatMoney(totals.avgWinning)} icon={<TrendingUp className="size-4" />} />
        <StatCard label="القيمة السوقية للكتالوج" value={formatMoney(totals.retail)} hint="مجموع قيم السوق المرجعية" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">المبيعات حسب الشهر</h2>
          <p className="text-[10px] text-ink-600">استنادًا إلى تاريخ آخر تحديث للوت المباع</p>
          <Bars rows={report.byMonth.map((row) => ({ label: row.month, value: row.sold, hint: `${formatNumber(row.sold)} سيارة · ${formatMoney(row.value)}` }))} />
        </section>
        <section className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">توزّع الأضرار</h2>
          <p className="text-[10px] text-ink-600">يساعد في تحديد فئات الإصلاح الأكثر طلبًا</p>
          <Bars rows={report.byDamage.map((row) => ({ label: row.label, value: row.count }))} />
        </section>
        <section className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">الماركات الأكثر عرضًا</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-[10px] text-ink-600">
                <tr><th className="py-1 text-start font-bold">الماركة</th><th className="py-1 text-start font-bold">اللوتات</th><th className="py-1 text-start font-bold">متوسط المزايدة</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.byMake.map((row) => (
                  <tr key={row.make}>
                    <td className="py-1.5 font-bold text-ink-950">{row.make}</td>
                    <td className="py-1.5 text-ink-700">{formatNumber(row.count)}</td>
                    <td className="py-1.5 text-ink-700">{formatMoney(row.avgBid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="card p-4">
          <h2 className="text-sm font-extrabold text-ink-950">الإيرادات والتحصيل</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-success/10 px-3 py-2"><p className="text-ink-600">محصّل</p><p className="text-base font-extrabold text-success">{formatMoney(overview.stats.collected)}</p></div>
            <div className="rounded-lg bg-gold-500/10 px-3 py-2"><p className="text-ink-600">عمولات</p><p className="text-base font-extrabold text-[#8a6413]">{formatMoney(overview.stats.fees)}</p></div>
            <div className="rounded-lg bg-cream-100 px-3 py-2"><p className="text-ink-600">حجم المزايدات</p><p className="text-base font-extrabold text-ink-950">{formatMoney(overview.stats.volume)}</p></div>
            <div className="rounded-lg bg-danger/10 px-3 py-2"><p className="text-ink-600">فواتير معلقة</p><p className="text-base font-extrabold text-danger">{formatNumber(overview.stats.pendingInvoices)}</p></div>
          </div>
          <p className="mt-3 rounded-md bg-cream-100 px-2.5 py-2 text-[10px] leading-5 text-ink-600">
            هذه التقارير تُحسب مباشرة من قاعدة البيانات (بدون بيانات ثابتة) وتُستخدم لمتابعة الأداء وتحديد العمولات.
          </p>
        </section>
      </div>
    </div>
  );
}
