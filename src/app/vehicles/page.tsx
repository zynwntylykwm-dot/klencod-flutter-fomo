import type { Metadata } from "next";

import { ResultsSection } from "@/components/results-section";
import { PageHero } from "@/components/ui";
import { parseFilters } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "جميع السيارات",
  description: "تصفّح جميع لوتات السيارات مع فلاتر متقدمة للماركة والطراز والسنة والسعر والضرر والموقع.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VehiclesPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  return (
    <div>
      <PageHero
        eyebrow="كتالوج اللوتات"
        title="جميع السيارات"
        description="أكثر من لوت في المزادات المباشرة والقادمة والأرشيف. استخدم الفلاتر للجمع بين الماركة، الطراز، سنة الصنع، السعر، نوع الوقود، ناقل الحركة، حالة التشغيل، نوع الضرر، الموقع، VIN ورقم اللوت."
      />
      <ResultsSection filters={filters} basePath="/vehicles" />
    </div>
  );
}
