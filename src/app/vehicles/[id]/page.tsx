import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  Car,
  CheckCircle2,
  ChevronLeft,
  Cog,
  FileText,
  Fuel,
  Gauge,
  KeyRound,
  MapPin,
  Palette,
  ShieldCheck,
  Tag,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";

import { BidPanel } from "@/components/bid-panel";
import { Countdown } from "@/components/countdown";
import { Gallery } from "@/components/gallery";
import { Badge, SectionHeading, StatusPill } from "@/components/ui";
import { VehicleCard } from "@/components/vehicle-card";
import { WatchButton } from "@/components/watch-button";
import { getCurrentUser } from "@/lib/auth";
import { CONDITIONS } from "@/lib/constants";
import {
  bidderAlias,
  formatDate,
  formatDateTime,
  formatMileage,
  formatMoney,
  formatNumber,
  maskVin,
} from "@/lib/format";
import {
  getBidHistory,
  getPlatformSettings,
  getRelatedVehicles,
  getVehicleById,
  getWatchlistIds,
  isWatched,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(Number(id));
  if (!vehicle) return { title: "اللوت غير موجود" };
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} — لوت ${vehicle.lotNumber}`,
    description: `${vehicle.year} ${vehicle.make} ${vehicle.model} في مزاد ${vehicle.locationCity}. ${vehicle.damageType}. مزايدة حالية ${formatMoney(vehicle.currentBid)}.`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) notFound();

  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) notFound();

  const user = await getCurrentUser();
  const [history, related, config, watched] = await Promise.all([
    getBidHistory(vehicleId),
    getRelatedVehicles(vehicle),
    getPlatformSettings(),
    isWatched(user?.id, vehicleId),
  ]);
  const relatedWatched = new Set(user ? await getWatchlistIds(user.id) : []);
  const leader = history[0] ?? null;
  const isWinner = Boolean(user && vehicle.winnerId === user.id);
  const reserveMet = !vehicle.reservePrice || vehicle.currentBid >= vehicle.reservePrice;

  const specs = [
    { label: "الشركة المصنعة", value: vehicle.make, icon: Car },
    { label: "الطراز", value: `${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`, icon: Tag },
    { label: "سنة الصنع", value: String(vehicle.year), icon: CalendarClock },
    { label: "قراءة العداد", value: formatMileage(vehicle.mileage), icon: Gauge },
    { label: "نوع الوقود", value: vehicle.fuelType, icon: Fuel },
    { label: "ناقل الحركة", value: vehicle.transmission, icon: Cog },
    { label: "نوع السيارة", value: vehicle.bodyType, icon: Car },
    { label: "اللون", value: vehicle.color, icon: Palette },
    { label: "حالة التشغيل", value: CONDITIONS.find((item) => item.value === vehicle.condition)?.label ?? vehicle.runCondition, icon: CheckCircle2 },
    { label: "المفاتيح", value: vehicle.keysPresent ? "متوفرة" : "غير متوفرة", icon: KeyRound },
    { label: "حالة الملكية", value: vehicle.titleStatus, icon: FileText },
    { label: "البائع", value: vehicle.seller, icon: BadgeCheck },
  ];

  return (
    <div className="bg-cream-50">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-2.5 text-[11px] text-ink-600">
          <Link href="/" className="hover:text-petrol-500">الرئيسية</Link>
          <ChevronLeft className="size-3" />
          <Link href="/vehicles" className="hover:text-petrol-500">السيارات</Link>
          <ChevronLeft className="size-3" />
          <span className="font-bold text-ink-950">لوت #{vehicle.lotNumber}</span>
          <span className="ms-auto flex items-center gap-1 font-bold text-petrol-500" dir="ltr">
            LOT #{vehicle.lotNumber}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={vehicle.status} />
              <Badge tone="neutral">{vehicle.auctionName ?? "بدون مزاد"}</Badge>
              {vehicle.damageType !== "بدون أضرار" ? <Badge tone="gold">{vehicle.damageType}</Badge> : <Badge tone="success">بدون أضرار</Badge>}
              {!reserveMet ? <Badge tone="danger">الاحتياطي غير مستوفى</Badge> : null}
            </div>
            <h1 className="mt-2 text-2xl font-black text-ink-950 sm:text-3xl">
              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim ? <span className="text-ink-600">{vehicle.trim}</span> : null}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
              <span className="flex items-center gap-1"><MapPin className="size-3.5 text-gold-500" /> {vehicle.locationCity} · {vehicle.locationCountry}</span>
              <span>VIN: <span className="font-mono font-bold text-ink-900" dir="ltr">{maskVin(vehicle.vin)}</span></span>
              <span>{formatNumber(vehicle.mileage)} كم</span>
              <span>{vehicle.fuelType} · {vehicle.transmission}</span>
            </div>
          </div>
          <div className="text-end">
            <p className="text-[11px] text-ink-600">أعلى مزايدة</p>
            <p className="text-3xl font-black text-ink-950">{formatMoney(vehicle.status === "sold" ? vehicle.winningBid ?? vehicle.currentBid : vehicle.currentBid)}</p>
            <p className="text-[11px] text-ink-600">{formatNumber(vehicle.bidCount)} مزايدة · عبر {formatNumber(history.length)} عملية مسجلة</p>
          </div>
        </div>

        {vehicle.status === "sold" ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-sm text-[#7a5a12]">
            <Trophy className="size-4" />
            <span className="font-extrabold">{isWinner ? "أنت الفائز بهذا اللوت!" : "تمت عملية البيع بنجاح."}</span>
            <span>سعر البيع النهائي {formatMoney(vehicle.winningBid ?? vehicle.currentBid)}</span>
            {isWinner ? (
              <Link href="/dashboard/payments" className="font-bold underline">عرض الفاتورة والدفع</Link>
            ) : null}
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_370px]">
          <div className="space-y-5">
            <Gallery images={vehicle.images ?? []} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} — لوت ${vehicle.lotNumber}`} />

            <section className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-ink-950">بيانات السيارة</h2>
                <span className="text-[10px] text-ink-600">مصدر البيانات: فحص المنصة</span>
              </div>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="rounded-lg border border-line bg-cream-50 px-2.5 py-2">
                    <dt className="flex items-center gap-1 text-[10px] text-ink-600"><spec.icon className="size-3 text-petrol-500" /> {spec.label}</dt>
                    <dd className="mt-0.5 truncate text-xs font-extrabold text-ink-950">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div className="rounded-lg bg-petrol-500/10 px-3 py-2">
                  <p className="text-[10px] font-bold text-petrol-500">قيمة السوق التقديرية</p>
                  <p className="text-base font-extrabold text-ink-950">{formatMoney(vehicle.retailValue)}</p>
                </div>
                <div className="rounded-lg bg-gold-500/10 px-3 py-2">
                  <p className="text-[10px] font-bold text-[#8a6413]">تكلفة الإصلاح التقديرية</p>
                  <p className="text-base font-extrabold text-ink-950">{formatMoney(vehicle.repairCost)}</p>
                </div>
              </div>
            </section>

            <section className="card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><AlertTriangle className="size-4 text-gold-500" /> الأضرار وحالة التشغيل</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.4fr]">
                <div className="space-y-2">
                  <div className="rounded-lg bg-danger/5 px-3 py-2">
                    <p className="text-[10px] text-ink-600">نوع الضرر الأساسي</p>
                    <p className="text-xs font-extrabold text-danger">{vehicle.damageType}</p>
                  </div>
                  <div className="rounded-lg bg-cream-100 px-3 py-2">
                    <p className="text-[10px] text-ink-600">حالة التشغيل</p>
                    <p className="text-xs font-extrabold text-ink-950">{vehicle.runCondition}</p>
                  </div>
                  <div className="rounded-lg bg-cream-100 px-3 py-2">
                    <p className="text-[10px] text-ink-600">نوع الوثيقة</p>
                    <p className="text-xs font-extrabold text-ink-950">{vehicle.titleStatus}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-line p-3">
                  <p className="text-[10px] font-bold text-ink-600">وصف الأضرار من تقرير الفحص</p>
                  <p className="mt-1 text-xs leading-6 text-ink-800">{vehicle.damageDescription}</p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-600">
                    <Wrench className="size-3 text-petrol-500" /> تكلفة الإصلاح التقديرية {formatMoney(vehicle.repairCost)} — تقديرات إرشادية وليست ضمانًا فنيًا.
                  </p>
                </div>
              </div>
            </section>

            <section className="card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Users className="size-4 text-petrol-500" /> سجل المزايدات</h2>
                <span className="text-[10px] text-ink-600">هويات المزايدين مخفية — يظهر رقم المزايد فقط</span>
              </div>
              {history.length === 0 ? (
                <p className="rounded-lg bg-cream-100 px-3 py-6 text-center text-xs text-ink-600">لا توجد مزايدات مسجلة على هذا اللوت بعد. كن أول من يزايد.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-line text-[10px] text-ink-600">
                        <th className="pb-2 text-start font-bold">#</th>
                        <th className="pb-2 text-start font-bold">المزايد</th>
                        <th className="pb-2 text-start font-bold">المبلغ</th>
                        <th className="pb-2 text-start font-bold">الوقت (UTC)</th>
                        <th className="pb-2 text-start font-bold">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {history.map((bid, index) => (
                        <tr key={bid.id} className={index === 0 ? "bg-gold-500/5" : ""}>
                          <td className="py-2 text-ink-600">{index + 1}</td>
                          <td className="py-2 font-bold text-ink-800">
                            {bid.userId === user?.id ? "أنت" : bidderAlias(bid.userId)}
                            <span className="ms-1 text-[10px] font-normal text-ink-600">({bid.bidderNumber})</span>
                          </td>
                          <td className="py-2 font-extrabold text-ink-950">{formatMoney(bid.amount)}</td>
                          <td className="py-2 text-ink-600">{formatDateTime(bid.createdAt)}</td>
                          <td className="py-2">{index === 0 ? <Badge tone="gold">الأعلى</Badge> : <span className="text-[10px] text-ink-600">مُسجّلة</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="card p-4">
              <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><CalendarClock className="size-4 text-petrol-500" /> بيانات المزاد والموقع</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-cream-100 px-3 py-2.5">
                  <p className="text-[10px] text-ink-600">قاعة المزاد</p>
                  <p className="text-xs font-extrabold text-ink-950">{vehicle.auctionName ?? "—"} {vehicle.auctionCode ? `(${vehicle.auctionCode})` : ""}</p>
                  <p className="mt-1 text-[10px] text-ink-600">البداية: {formatDateTime(vehicle.auctionStart)}</p>
                  <p className="text-[10px] text-ink-600">النهاية: {formatDateTime(vehicle.auctionEnd)}</p>
                </div>
                <div className="rounded-lg bg-cream-100 px-3 py-2.5">
                  <p className="text-[10px] text-ink-600">موقع السيارة</p>
                  <p className="text-xs font-extrabold text-ink-950">{vehicle.locationCity}</p>
                  <p className="text-[10px] text-ink-600">{vehicle.locationCountry}</p>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-600"><ShieldCheck className="size-3 text-success" /> الفحص والاستلام من الموقع المرخّص</p>
                </div>
                <div className="rounded-lg bg-cream-100 px-3 py-2.5 sm:col-span-2">
                  <p className="text-[10px] text-ink-600">أرقام مرجعية</p>
                  <p className="text-xs font-bold text-ink-950">VIN: <span className="font-mono" dir="ltr">{vehicle.vin}</span> · LOT: <span className="font-mono" dir="ltr">{vehicle.lotNumber}</span></p>
                  <p className="mt-1 text-[10px] text-ink-600">أضيف في {formatDate(vehicle.createdAt)} · آخر تحديث {formatDateTime(vehicle.updatedAt)}</p>
                </div>
              </div>
            </section>

            {related.length > 0 ? (
              <section>
                <SectionHeading eyebrow="مقارنة" title="لوتات مشابهة" />
                <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {related.map((item) => (
                    <VehicleCard key={item.id} vehicle={item} watched={relatedWatched.has(item.id)} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <BidPanel
              vehicleId={vehicle.id}
              initial={{
                currentBid: vehicle.currentBid,
                bidCount: vehicle.bidCount,
                minIncrement: vehicle.minIncrement,
                status: vehicle.status,
                auctionEnd: vehicle.auctionEnd.toISOString(),
                auctionStart: vehicle.auctionStart.toISOString(),
                winningBid: vehicle.winningBid,
                winnerId: vehicle.winnerId,
              }}
              authenticated={Boolean(user)}
              leaderId={leader?.userId ?? null}
              currentUserId={user?.id ?? null}
              watched={watched}
              buyerFeePercent={config.buyerFeePercent}
              minBuyerFee={config.minBuyerFee}
              docFee={config.docFee}
            />

            <div className="card space-y-3 p-4">
              <WatchButton vehicleId={vehicle.id} initial={watched} variant="full" />
              <div className="rounded-lg bg-cream-100 px-3 py-2 text-[11px] leading-6 text-ink-700">
                <p className="font-extrabold text-ink-950">كيف تُسجَّل مزايدتك؟</p>
                <p>تتحقق الخادم من حالة المزاد والحد الأدنى للزيادة، ثم تحفظ المزايدة باسم رقم مزايدك وتُشعر صاحب أعلى مزايدة سابقة.</p>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between"><span className="text-ink-600">سعر البدء</span><span className="font-bold text-ink-950">{formatMoney(vehicle.startingBid)}</span></div>
                <div className="flex items-center justify-between"><span className="text-ink-600">الحد الأدنى للزيادة</span><span className="font-bold text-ink-950">{formatMoney(vehicle.minIncrement)}</span></div>
                <div className="flex items-center justify-between"><span className="text-ink-600">السعر الاحتياطي</span><span className="font-bold text-ink-950">{vehicle.reservePrice ? formatMoney(vehicle.reservePrice) : "غير محدد"}</span></div>
                <div className="flex items-center justify-between"><span className="text-ink-600">عمولة المشتري</span><span className="font-bold text-ink-950">{config.buyerFeePercent}% (حد أدنى {formatMoney(config.minBuyerFee)})</span></div>
                <div className="flex items-center justify-between"><span className="text-ink-600">رسوم المستندات</span><span className="font-bold text-ink-950">{formatMoney(config.docFee)}</span></div>
              </div>
            </div>

            <div className="card p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-950"><MapPin className="size-3.5 text-gold-500" /> الاستلام والشحن</p>
              <p className="mt-1.5 text-[11px] leading-6 text-ink-600">
                الاستلام من {vehicle.locationCity} بعد السداد. الشحن الدولي متاح عبر شركاء المنصة (قابل للتوسع لاحقًا)،
                ويصلك إشعار عند تجهيز أوراق التسليم.
              </p>
              <div className="mt-2 rounded-md bg-cream-100 px-2.5 py-1.5 text-[10px] text-ink-600">
                تنبيه: هذه نسخة عرض توضيحية — لا تتم عمليات شحن أو تسليم فعلية، وبيانات اللوتات مولّدة لأغراض العرض.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
