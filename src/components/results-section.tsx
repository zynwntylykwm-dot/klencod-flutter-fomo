import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { FiltersPanel } from "@/components/filters-panel";
import { EmptyState, Pagination } from "@/components/ui";
import { VehicleCard } from "@/components/vehicle-card";
import { getCurrentUser } from "@/lib/auth";
import { filtersToQueryString, type VehicleFilters } from "@/lib/filters";
import { getWatchlistIds, searchVehicles } from "@/lib/queries";

const statusTabs = [
  { value: "", label: "الكل" },
  { value: "live", label: "مباشر" },
  { value: "upcoming", label: "قادم" },
  { value: "sold", label: "مباع" },
];

export async function ResultsSection({
  filters,
  basePath = "/vehicles",
  forcedStatus,
  forcedParams = {},
  emptyTitle = "لا توجد نتائج مطابقة",
  emptyDescription = "جرّب تعديل الفلاتر أو توسيع نطاق السعر وسنة الصنع.",
}: {
  filters: VehicleFilters;
  basePath?: string;
  forcedStatus?: string;
  forcedParams?: Record<string, string>;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [result, user] = await Promise.all([searchVehicles(filters, forcedStatus), getCurrentUser()]);
  const watched = new Set(user ? await getWatchlistIds(user.id) : []);

  const tabHref = (status: string) => {
    const query = filtersToQueryString({ ...filters, status, page: 1 });
    const extra = new URLSearchParams(forcedParams);
    const params = new URLSearchParams(query);
    extra.forEach((value, key) => params.set(key, value));
    if (status) params.set("status", status);
    else params.delete("status");
    return `${basePath}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[286px_1fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <FiltersPanel
          key={JSON.stringify(filters)}
          initial={filters}
          basePath={basePath}
          forcedParams={forcedParams}
        />
      </div>
      <div>
        <div className="card mb-4 flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <SlidersHorizontal className="size-4 text-petrol-500" />
            {result.total > 0 ? `${result.total} لوت متاح` : "لا توجد لوتات"}
            <span className="text-xs font-normal text-ink-600">
              {filters.q ? `· نتائج البحث عن "${filters.q}"` : ""}
            </span>
          </p>
          {!forcedStatus ? (
            <div className="flex flex-wrap items-center gap-1">
              {statusTabs.map((tab) => {
                const active = (filters.status || "") === tab.value;
                return (
                  <Link
                    key={tab.label}
                    href={tabHref(tab.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      active ? "bg-ink-900 text-white" : "bg-cream-100 text-ink-700 hover:bg-cream-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {result.rows.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={
              <Link href="/vehicles" className="btn btn-ink">
                تصفّح جميع السيارات
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.rows.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} watched={watched.has(vehicle.id)} />
            ))}
          </div>
        )}

        <Pagination page={result.page} pages={result.pages} basePath={basePath} params={{ ...filters, ...forcedParams }} />
      </div>
    </div>
  );
}
