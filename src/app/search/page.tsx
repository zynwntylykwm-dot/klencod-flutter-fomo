import type { Metadata } from "next";

import { ResultsSection } from "@/components/results-section";
import { SearchBar } from "@/components/search-bar";
import { PageHero } from "@/components/ui";
import { parseFilters } from "@/lib/filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نتائج البحث",
  description: "ابحث في لوتات السيارات بالماركة أو الطراز أو VIN أو رقم اللوت.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  return (
    <div>
      <PageHero
        eyebrow="محرك البحث"
        title={filters.q ? `نتائج البحث عن "${filters.q}"` : "البحث المتقدم"}
        description="ابحث بالشركة المصنعة، الطراز، سنة الصنع، رقم الهيكل VIN أو رقم المزاد Lot، ثم أضف فلاتر إضافية لتضييق النتائج."
      >
        <SearchBar initialTerm={filters.q} />
      </PageHero>
      <ResultsSection
        filters={filters}
        basePath="/search"
        emptyTitle="لا توجد نتائج لهذا البحث"
        emptyDescription="جرّب مصطلحًا مختلفًا أو ابحث برقم اللوت أو VIN، أو استخدم الفلاتر لعرض أوسع."
      />
    </div>
  );
}
