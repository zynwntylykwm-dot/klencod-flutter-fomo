import type { Metadata } from "next";
import { BadgeDollarSign, FileCheck2, Landmark } from "lucide-react";

import { ResultsSection } from "@/components/results-section";
import { PageHero, StatCard } from "@/components/ui";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseFilters } from "@/lib/filters";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "السيارات المباعة",
  description: "أرشيف السيارات المباعة مع أسعار البيع النهائية وبيانات الفواتير.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SoldPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const stats = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${vehicles.winningBid}), 0)::int`,
      avg: sql<number>`coalesce(round(avg(${vehicles.winningBid})), 0)::int`,
      retail: sql<number>`coalesce(sum(${vehicles.retailValue}), 0)::int`,
    })
    .from(vehicles)
    .where(eq(vehicles.status, "sold"));
  const row = stats[0] ?? { count: 0, total: 0, avg: 0, retail: 0 };

  return (
    <div>
      <PageHero
        eyebrow="الأرشيف"
        title="السيارات المباعة"
        description="سجل شفاف لكل عملية بيع مكتملة: سعر البيع النهائي، عدد المزايدات، والفاتورة الصادرة للفائز. استخدم السجل لتحليل الأسعار قبل المزايدة."
      />
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="عمليات بيع مكتملة" value={formatNumber(row.count)} icon={<FileCheck2 className="size-4" />} hint="تُغلق تلقائيًا عند انتهاء العدّاد" />
          <StatCard label="إجمالي قيمة البيع" value={formatMoney(row.total)} icon={<BadgeDollarSign className="size-4" />} />
          <StatCard label="متوسط سعر البيع" value={formatMoney(row.avg)} icon={<Landmark className="size-4" />} />
          <StatCard label="قيمة السوق المرجعية" value={formatMoney(row.retail)} hint="مجموع قيم السوق للوتات المباعة" />
        </div>
      </div>
      <ResultsSection
        filters={filters}
        basePath="/sold"
        forcedStatus="sold"
        forcedParams={{ status: "sold" }}
        emptyTitle="لا توجد سيارات مباعة مطابقة"
        emptyDescription="غيّر الفلاتر أو تصفّح السيارات المباشرة."
      />
    </div>
  );
}
