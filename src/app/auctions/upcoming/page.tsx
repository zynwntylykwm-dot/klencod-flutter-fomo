import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, CalendarClock, Heart } from "lucide-react";

import { AuctionCard } from "@/components/auction-card";
import { ResultsSection } from "@/components/results-section";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { parseFilters } from "@/lib/filters";
import { getAuctionsByStatus, getHomeData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المزادات القادمة",
  description: "مواعيد المزادات القادمة واللوتات المتاحة للمزايدة المسبقة والمتابعة.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function UpcomingAuctionsPage({ searchParams }: Props) {
  const [filters, auctions, home] = await Promise.all([
    searchParams.then(parseFilters),
    getAuctionsByStatus("upcoming"),
    getHomeData(),
  ]);
  return (
    <div>
      <PageHero
        eyebrow="التخطيط المسبق"
        title="المزادات القادمة"
        description="اطّلع على مواعيد المزادات المستقبلية، أضف اللوتات إلى المفضلة، وتابعها من لوحة التحكم لتكون جاهزًا في اللحظة الأولى."
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/register" className="btn btn-gold px-4 py-2 text-xs"><BellRing className="size-4" /> فعّل تنبيهات المزادات</Link>
          <Link href="/watchlist" className="btn border border-white/20 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10"><Heart className="size-4" /> قائمة المفضلة</Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SectionHeading eyebrow="الجدول الزمني" title="مواعيد المزادات" description="العدّاد يعرض الوقت المتبقي حتى بدء كل مزاد (توقيت UTC)." />
        {auctions.length === 0 ? (
          <div className="mt-4"><EmptyState title="لا توجد مزادات قادمة مسجلة" description="يتم تحديث الجدول باستمرار من لوحة الإدارة." /></div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "الفحص المسبق", body: "راجع الصور وتقرير الأضرار وقيمة الإصلاح التقديرية قبل بدء المزاد.", icon: CalendarClock },
            { title: "المزايدة المسبقة", body: "بعض اللوتات تقبل مزايدة مسبقة؛ عند البدء تُطبَّق أعلى مزايدة تلقائيًا.", icon: BellRing },
            { title: "تذكير الإغلاق", body: "يصلك إشعار قبل انتهاء مزاد أي لوت في مفضلتك عبر المنصة.", icon: Heart },
          ].map((item) => (
            <div key={item.title} className="card flex items-start gap-2.5 p-4">
              <span className="rounded-lg bg-gold-500/15 p-2 text-[#8a6413]"><item.icon className="size-4" /></span>
              <div>
                <p className="text-xs font-extrabold text-ink-950">{item.title}</p>
                <p className="mt-0.5 text-[11px] leading-6 text-ink-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        {home.upcoming.length > 0 ? (
          <p className="mt-4 text-xs text-ink-600">
            مثال على اللوتات القادمة:{" "}
            {home.upcoming.map((vehicle, index) => (
              <span key={vehicle.id}>
                {index > 0 ? " · " : ""}
                <Link href={`/vehicles/${vehicle.id}`} className="font-bold text-petrol-500 hover:underline">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>

      <ResultsSection
        filters={filters}
        basePath="/auctions/upcoming"
        forcedStatus="upcoming"
        forcedParams={{ status: "upcoming" }}
        emptyTitle="لا توجد لوتات قادمة مطابقة"
        emptyDescription="جرّب إزالة بعض الفلاتر لعرض المزيد من اللوتات القادمة."
      />
    </div>
  );
}
