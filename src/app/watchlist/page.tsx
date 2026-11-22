import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { EmptyState, PageHero } from "@/components/ui";
import { VehicleCard } from "@/components/vehicle-card";
import { requireUser } from "@/lib/auth";
import { getWatchlistVehicles } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "السيارات المفضلة" };

export default async function WatchlistPage() {
  const user = await requireUser("/watchlist");
  const vehicles = await getWatchlistVehicles(user.id);

  return (
    <div>
      <PageHero
        eyebrow="متابعة شخصية"
        title="قائمة المفضلة"
        description="كل اللوتات التي أضفتها للمتابعة في مكان واحد مع العدّاد التنازلي وحالة المزاد المحدثة."
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <Heart className="size-4 text-danger" /> {vehicles.length} لوت في المفضلة
          </p>
          <Link href="/vehicles" className="btn btn-outline text-xs">إضافة المزيد</Link>
        </div>
        {vehicles.length === 0 ? (
          <EmptyState
            title="قائمة المفضلة فارغة"
            description="اضغط على أيقونة القلب في أي لوت لإضافته هنا ومتابعة العدّاد التنازلي وأحدث المزايدات."
            action={<Link href="/vehicles" className="btn btn-ink">تصفّح السيارات</Link>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} watched />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
