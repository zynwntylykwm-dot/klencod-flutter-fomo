import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CreditCard, Gavel, Mail, MapPin, Phone, ShieldCheck, Settings, Trophy, User as UserIcon } from "lucide-react";

import { Badge, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { getUserDashboard } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الملف الشخصي" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const data = await getUserDashboard(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="card overflow-hidden">
        <div className="hero-mesh h-24" />
        <div className="px-5 pb-5">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <span className="flex size-16 items-center justify-center rounded-2xl border-4 border-white bg-ink-900 text-xl font-black text-gold-300 shadow">
                {user.name.slice(0, 1)}
              </span>
              <div className="pb-1">
                <h1 className="text-lg font-extrabold text-ink-950">{user.name}</h1>
                <p className="flex items-center gap-1.5 text-[11px] text-ink-600">
                  <span dir="ltr" className="font-mono">{user.bidderNumber}</span>
                  <Badge tone={user.role === "admin" ? "gold" : "neutral"}>{user.role === "admin" ? "مدير المنصة" : "مزايد معتمد"}</Badge>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/settings" className="btn btn-outline text-xs"><Settings className="size-3.5" /> تعديل البيانات</Link>
              <Link href="/dashboard" className="btn btn-ink text-xs">لوحة التحكم</Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="عدد المزايدات" value={formatNumber(data.stats.totalBids)} icon={<Gavel className="size-4" />} />
            <StatCard label="لوتات مزايد عليها" value={formatNumber(data.stats.lotsBid)} icon={<UserIcon className="size-4" />} />
            <StatCard label="متصدر حاليًا" value={formatNumber(data.stats.leading)} icon={<ShieldCheck className="size-4" />} />
            <StatCard label="مرات الفوز" value={formatNumber(data.wins.length)} icon={<Trophy className="size-4" />} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <section className="rounded-xl border border-line p-4">
              <h2 className="text-sm font-extrabold text-ink-950">بيانات التواصل</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2"><Mail className="size-3.5 text-petrol-500" /><dt className="w-24 text-ink-600">البريد</dt><dd dir="ltr" className="font-bold text-ink-950">{user.email}</dd></div>
                <div className="flex items-center gap-2"><Phone className="size-3.5 text-petrol-500" /><dt className="w-24 text-ink-600">الجوال</dt><dd dir="ltr" className="font-bold text-ink-950">{user.phone || "غير مسجل"}</dd></div>
                <div className="flex items-center gap-2"><MapPin className="size-3.5 text-petrol-500" /><dt className="w-24 text-ink-600">الموقع</dt><dd className="font-bold text-ink-950">{user.city ? `${user.city}، ` : ""}{user.country || "—"}</dd></div>
                <div className="flex items-center gap-2"><CalendarDays className="size-3.5 text-petrol-500" /><dt className="w-24 text-ink-600">تاريخ التسجيل</dt><dd className="font-bold text-ink-950">{formatDate(user.createdAt)}</dd></div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-md bg-cream-100 px-2.5 py-2"><span className="block text-ink-600">إجمالي المدفوع</span><span className="font-extrabold text-ink-950">{formatMoney(data.stats.paidTotal)}</span></div>
                <div className="rounded-md bg-cream-100 px-2.5 py-2"><span className="block text-ink-600">مستحقات قائمة</span><span className="font-extrabold text-danger">{formatMoney(data.stats.dueTotal)}</span></div>
              </div>
            </section>

            <section className="rounded-xl border border-line p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-ink-950">آخر المزايدات</h2>
                <Link href="/dashboard/bids" className="text-[11px] font-bold text-petrol-500">السجل الكامل</Link>
              </div>
              {data.recentBids.length === 0 ? (
                <p className="mt-3 rounded-md bg-cream-100 px-3 py-6 text-center text-xs text-ink-600">لم تسجّل أي مزايدة بعد.</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {data.recentBids.map((bid) => (
                    <li key={bid.id} className="flex items-center justify-between gap-2 py-2 text-[11px]">
                      <Link href={`/vehicles/${bid.vehicleId}`} className="min-w-0 flex-1 truncate font-bold text-ink-950 hover:text-petrol-500">
                        {bid.year} {bid.make} {bid.model}
                        <span className="ms-1 font-mono text-[10px] font-normal text-ink-600" dir="ltr">#{bid.lotNumber}</span>
                      </Link>
                      <span className="font-extrabold text-ink-950">{formatMoney(bid.amount)}</span>
                      <Badge tone={bid.status === "sold" && bid.winnerId === user.id ? "gold" : bid.currentBid === bid.amount ? "success" : "neutral"}>
                        {bid.status === "sold" ? (bid.winnerId === user.id ? "فزت" : "خسرت") : bid.currentBid === bid.amount ? "متصدر" : "متجاوز"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-2">
                <Link href="/dashboard/payments" className="btn btn-outline flex-1 text-[11px]"><CreditCard className="size-3.5" /> الفواتير</Link>
                <Link href="/watchlist" className="btn btn-outline flex-1 text-[11px]">المفضلة</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
