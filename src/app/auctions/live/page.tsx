import type { Metadata } from "next";
import { Gauge, Radio, ShieldCheck } from "lucide-react";

import { AuctionCard } from "@/components/auction-card";
import { ResultsSection } from "@/components/results-section";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { parseFilters } from "@/lib/filters";
import { getAuctionsByStatus } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المزادات المباشرة",
  description: "تابع المزادات المباشرة وزايد لحظة بلحظة مع تحديث تلقائي للأسعار وعدّاد تنازلي.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LiveAuctionsPage({ searchParams }: Props) {
  const [filters, auctions] = await Promise.all([searchParams.then(parseFilters), getAuctionsByStatus("live")]);
  return (
    <div>
      <PageHero
        eyebrow="بث مباشر"
        title="المزادات المباشرة"
        description="لوتات مفتوحة للمزايدة الآن. كل مزايدة تُسجَّل فورًا على الخادم بعد التحقق من الحد الأدنى للزيادة وحالة المزاد، وتُمدَّد دقيقتان تلقائيًا إذا وقعت في اللحظات الأخيرة."
      >
        <div className="flex flex-wrap gap-2 text-[11px] font-bold text-cream-200/80">
          <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1"><Radio className="size-3.5 text-gold-400" /> تحديث تلقائي كل ٥ ثوانٍ</span>
          <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1"><ShieldCheck className="size-3.5 text-gold-400" /> تحقق خادمي من كل مزايدة</span>
          <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1"><Gauge className="size-3.5 text-gold-400" /> مكافحة المزايدة اللحظية</span>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        <SectionHeading eyebrow="قاعات المزاد" title="المزادات النشطة" description="اختر قاعة المزاد لعرض لوتاتها فقط." />
        {auctions.length === 0 ? (
          <div className="mt-4"><EmptyState title="لا توجد قاعات مباشرة الآن" description="سيبدأ المزاد التالي قريبًا، تابع صفحة المزادات القادمة." /></div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>

      <ResultsSection
        filters={filters}
        basePath="/auctions/live"
        forcedStatus="live"
        forcedParams={{ status: "live" }}
        emptyTitle="لا توجد لوتات مباشرة مطابقة"
        emptyDescription="خفّف الفلاتر أو تصفّح جميع السيارات للعثور على لوتات قادمة."
      />
    </div>
  );
}
