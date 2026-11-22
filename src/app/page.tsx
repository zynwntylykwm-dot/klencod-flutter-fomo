import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Car,
  FileCheck2,
  Gauge,
  Globe2,
  Heart,
  Search,
  ShieldCheck,
  Ship,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";

import { AuctionCard } from "@/components/auction-card";
import { SearchBar } from "@/components/search-bar";
import { SectionHeading } from "@/components/ui";
import { VehicleCard } from "@/components/vehicle-card";
import { getCurrentUser } from "@/lib/auth";
import { BODY_TYPES } from "@/lib/constants";
import { formatMoney, formatNumber } from "@/lib/format";
import { getHomeData, getWatchlistIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

const steps = [
  {
    title: "أنشئ حساب مزايد",
    description: "تسجيل مجاني باسمك وبيانات التواصل، ويُصدر النظام رقم مزايد خاص بك لحفظ كل عملياتك.",
    icon: UserCheck,
  },
  {
    title: "ابحث وافحص اللوت",
    description: "فلترة متقدمة بالماركة والطراز والسنة والضرر والموقع، مع معرض صور وفحص فني وتقدير إصلاح.",
    icon: Search,
  },
  {
    title: "زايد واربح",
    description: "مزايدات تُسجّل لحظيًا على الخادم، عند انتهاء المزاد يُحدد الفائز وتُصدر الفاتورة تلقائيًا.",
    icon: Gauge,
  },
];

const features = [
  { title: "مزايدات مسجّلة على الخادم", description: "كل مزايدة تُحفظ في قاعدة البيانات مع سجل كامل للوقت والمبلغ، ولا يمكن التلاعب بها من الواجهة.", icon: ShieldCheck },
  { title: "شفافية الرسوم", description: "عمولة المشتري ورسوم المستندات تظهر قبل المزايدة، وتُحتسب تلقائيًا في الفاتورة النهائية.", icon: FileCheck2 },
  { title: "مواقع متعددة", description: "لوتات في الولايات المتحدة وكندا والإمارات وأوروبا، مع خيارات شحن دولي مستقبلًا.", icon: Globe2 },
  { title: "متابعة كاملة", description: "مفضلة، إشعارات فورية عند تجاوز مزايدتك، وسجل مزايدات وفواتير في لوحة تحكم واحدة.", icon: Heart },
];

export default async function HomePage() {
  const data = await getHomeData();
  const user = await getCurrentUser();
  const watched = new Set(user ? await getWatchlistIds(user.id) : []);
  const featured = data.live.slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-yard.jpg" alt="ساحة مزادات السيارات" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-950 via-ink-950/90 to-ink-950/50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.02fr_1fr] lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-gold-300">
              <BadgeCheck className="size-3.5" /> منصة مزادات مستقلة · مزايدات فعلية محفوظة على الخادم
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[44px]">
              مزادات سيارات عالمية
              <span className="block text-gold-400">بثقة وشفافية لحظة بلحظة</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-cream-200/85 sm:text-base">
              تصفّح سيارات الإنقاذ والسيارات النظيفة من أساطيل الشركات وشركات التأمين، افحص الصور والتقارير، وتابع
              المزاد المباشر حتى اللحظة الأخيرة. منصة منارة تمنحك تجربة مزايدة واضحة من التسجيل حتى التسليم.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/vehicles" className="btn btn-gold px-5 py-3">
                <Car className="size-4" /> تصفّح السيارات
              </Link>
              <Link href="/auctions/live" className="btn border border-white/20 bg-white/5 px-5 py-3 text-white hover:bg-white/10">
                <span className="live-dot inline-block size-2 rounded-full bg-[#7ae0b1]" /> المزادات المباشرة
              </Link>
              <Link href="/how-it-works" className="btn px-4 py-3 text-cream-200/80 hover:text-white">
                كيف يعمل المزاد <ArrowLeft className="size-4" />
              </Link>
            </div>
            <dl className="mt-7 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "لوت مباشر الآن", value: formatNumber(data.stats.liveCount), icon: Gauge },
                { label: "سيارة مُباعة", value: formatNumber(data.stats.soldCount), icon: TrendingUp },
                { label: "شركة مصنّعة", value: formatNumber(data.stats.brandCount), icon: Globe2 },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                  <stat.icon className="mb-1 size-4 text-gold-400" />
                  <dt className="text-[10px] text-cream-200/70">{stat.label}</dt>
                  <dd className="text-lg font-extrabold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <SearchBar />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-cream-200/70">
              {["مزايدة مسجّلة بالوقت", "فلترة متقدمة", "إشعار تجاوز المزايدة"].map((item) => (
                <span key={item} className="rounded-md border border-white/10 bg-white/5 px-1 py-1.5">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-7 max-w-7xl px-4">
        <div className="grid gap-3 md:grid-cols-4">
          {features.slice(0, 4).map((feature) => (
            <div key={feature.title} className="card flex items-start gap-2.5 p-3.5 shadow-sm">
              <span className="rounded-lg bg-petrol-500/10 p-2 text-petrol-500">
                <feature.icon className="size-4" />
              </span>
              <div>
                <p className="text-xs font-extrabold text-ink-950">{feature.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-5 text-ink-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <SectionHeading
          eyebrow="فرص تنتهي قريبًا"
          title="مزادات مباشرة الآن"
          description="لوتات نشطة تقبل المزايدة حاليًا، تنتهي في أوقات متفاوتة. الأسعار تُحدَّث تلقائيًا عند كل مزايدة."
          action={
            <Link href="/auctions/live" className="btn btn-outline text-xs">
              كل المزادات المباشرة <ArrowLeft className="size-4" />
            </Link>
          }
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} watched={watched.has(vehicle.id)} />
          ))}
        </div>
        {featured.length === 0 ? (
          <div className="card mt-5 p-8 text-center text-sm text-ink-600">لا توجد لوتات مباشرة الآن — تابع المزادات القادمة.</div>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <SectionHeading eyebrow="تصفّح حسب النوع" title="اعثر على سيارتك بسرعة" />
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {BODY_TYPES.map((body) => (
            <Link
              key={body}
              href={`/vehicles?bodyType=${encodeURIComponent(body)}`}
              className="group card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:border-petrol-400 hover:shadow"
            >
              <span className="rounded-full bg-cream-100 p-2.5 text-petrol-500 transition group-hover:bg-gold-500/20 group-hover:text-[#8a6413]">
                {body === "شاحنة صغيرة" ? <Truck className="size-5" /> : body === "SUV" ? <Car className="size-5" /> : <Gauge className="size-5" />}
              </span>
              <span className="text-xs font-extrabold text-ink-950">{body}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <SectionHeading
          eyebrow="الجدول القادم"
          title="مزادات قادمة"
          description="سجّل مسبقًا وأضف اللوتات إلى المفضلة قبل بدء المزاد لتكون جاهزًا في اللحظة الأولى."
          action={
            <Link href="/auctions/upcoming" className="btn btn-outline text-xs">
              كل المزادات القادمة <CalendarClock className="size-4" />
            </Link>
          }
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.upcomingAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      <section className="mt-12 bg-ink-950 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold text-gold-400">كيف تعمل المنصة</p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-white md:text-3xl">ثلاث خطوات من التسجيل إلى التسليم</h2>
              <p className="mt-2.5 text-sm leading-7 text-cream-200/75">
                نظام مزايدة متكامل يتحقق من كل مزايدة مقابل أعلى سعر والحد الأدنى للزيادة وحالة المزاد، ثم يسجلها باسم
                رقم مزايدك ويصدر الفاتورة عند الإغلاق.
              </p>
              <div className="mt-5 grid gap-2 text-xs text-cream-200/80 sm:grid-cols-2">
                {["تحقق من صلاحية كل مزايدة", "منع المزايدات المنخفضة", "إشعار المزايد الذي تجاوزوه", "تمديد تلقائي لمكافحة القنص"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">
                    <ShieldCheck className="size-3.5 text-gold-400" /> {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-gold-500 text-sm font-black text-ink-950">{index + 1}</span>
                  <step.icon className="mt-3 size-5 text-gold-400" />
                  <h3 className="mt-2 text-sm font-extrabold text-white">{step.title}</h3>
                  <p className="mt-1 text-[11px] leading-6 text-cream-200/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading eyebrow="أرقام المنصة" title="سوق نشط وشفاف" description="إحصاءات مباشرة من قاعدة بيانات المنصة — تتحدث مع كل مزايدة ومع كل مزاد يُغلق." />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: "قيمة أعلى المزايدات", value: formatMoney(data.stats.liveValue), icon: TrendingUp },
                { label: "لوتات مباشرة", value: formatNumber(data.stats.liveCount), icon: Gauge },
                { label: "لوتات قادمة", value: formatNumber(data.upcoming.length), icon: CalendarClock },
                { label: "عمليات بيع مكتملة", value: formatNumber(data.stats.soldCount), icon: FileCheck2 },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <stat.icon className="size-4 text-petrol-500" />
                  <p className="mt-2 text-xl font-extrabold text-ink-950">{stat.value}</p>
                  <p className="text-[11px] text-ink-600">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-ink-700"><Ship className="size-3.5 text-petrol-500" /> خيارات شحن مستقبلية:</span>
              {data.topMakes.slice(0, 6).map((make) => (
                <Link key={make.make} href={`/vehicles?make=${encodeURIComponent(make.make)}`} className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:border-petrol-400 hover:text-petrol-500">
                  {make.make} <span className="text-ink-600">({make.count})</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="hero-mesh px-4 py-3">
              <h3 className="text-sm font-extrabold text-white">ابدأ التصفّح الآن</h3>
              <p className="text-[11px] text-cream-200/70">اختر طريقة العرض المناسبة لك</p>
            </div>
            <div className="divide-y divide-line">
              {[
                { label: "السيارات المباشرة", description: "لوتات تقبل المزايدة الآن", href: "/auctions/live", icon: Gauge },
                { label: "السيارات القادمة", description: "استعد قبل بدء المزاد", href: "/auctions/upcoming", icon: CalendarClock },
                { label: "السيارات المباعة", description: "أسعار البيع النهائية للتحليل", href: "/sold", icon: FileCheck2 },
                { label: "قائمة المفضلة", description: "كل ما تتابعه في مكان واحد", href: "/watchlist", icon: Heart },
                { label: "كيف يعمل المزاد", description: "الأسئلة الشائعة وخطوات الشراء", href: "/how-it-works", icon: Users },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-cream-100">
                  <span className="rounded-md bg-cream-100 p-2 text-petrol-500"><item.icon className="size-4" /></span>
                  <span className="flex-1">
                    <span className="block text-xs font-extrabold text-ink-950">{item.label}</span>
                    <span className="block text-[10px] text-ink-600">{item.description}</span>
                  </span>
                  <ArrowLeft className="size-4 text-ink-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="overflow-hidden rounded-2xl bg-gold-500">
          <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-ink-950">جاهز للمزايدة على سيارتك القادمة؟</h2>
              <p className="mt-1.5 max-w-xl text-sm text-ink-900/80">
                أنشئ حسابك مجانًا، أضف اللوتات إلى المفضلة، واضبط تنبيهاتك ليصلك إشعار فوري عند تجاوز مزايدتك.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/register" className="btn btn-ink px-5 py-3">
                إنشاء حساب مزايد
              </Link>
              <Link href="/login" className="btn bg-white px-5 py-3 text-ink-950 hover:bg-cream-100">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
