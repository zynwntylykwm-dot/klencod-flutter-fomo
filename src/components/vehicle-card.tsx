import Link from "next/link";
import { ArrowLeft, Cog, Fuel, Gauge, MapPin, Users } from "lucide-react";

import { Countdown } from "@/components/countdown";
import { Badge, StatusPill } from "@/components/ui";
import { WatchButton } from "@/components/watch-button";
import { formatMoney, formatNumber, maskVin } from "@/lib/format";
import type { VehicleRow } from "@/lib/queries";

export function VehicleCard({
  vehicle,
  watched = false,
  showWatch = true,
}: {
  vehicle: VehicleRow;
  watched?: boolean;
  showWatch?: boolean;
}) {
  const image = vehicle.images?.[0] ?? "/images/hero-yard.jpg";
  const isSold = vehicle.status === "sold";
  const price = isSold ? vehicle.winningBid ?? vehicle.currentBid : vehicle.currentBid || vehicle.startingBid;

  return (
    <article className="card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <Link href={`/vehicles/${vehicle.id}`} className="block aspect-[16/10] overflow-hidden bg-cream-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${isSold ? "grayscale-[35%]" : ""}`}
          />
        </Link>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <StatusPill status={vehicle.status} />
          {showWatch ? <WatchButton vehicleId={vehicle.id} initial={watched} /> : null}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink-950/95 via-ink-950/45 to-transparent p-3 pt-9">
          <div>
            <p className="text-[10px] font-semibold text-white/70">{isSold ? "سعر البيع النهائي" : "أعلى مزايدة"}</p>
            <p className="text-xl font-extrabold text-white">{formatMoney(price)}</p>
            <p className="flex items-center gap-1 text-[10px] text-white/70">
              <Users className="size-3" /> {formatNumber(vehicle.bidCount)} مزايدة
            </p>
          </div>
          <Countdown end={vehicle.auctionEnd?.toString() ?? null} start={vehicle.auctionStart?.toString() ?? null} status={vehicle.status} compact tone="dark" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-cream-100 px-1.5 py-0.5 text-[10px] font-extrabold text-petrol-500" dir="ltr">
            LOT #{vehicle.lotNumber}
          </span>
          <Badge tone={vehicle.damageType === "بدون أضرار" ? "success" : "gold"}>{vehicle.damageType}</Badge>
        </div>
        <Link href={`/vehicles/${vehicle.id}`} className="mt-2 block">
          <h3 className="line-clamp-1 text-[15px] font-extrabold text-ink-950 transition group-hover:text-petrol-500">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-600">
            {vehicle.trim ? `${vehicle.trim} · ` : ""}
            <span dir="ltr">VIN {maskVin(vehicle.vin)}</span>
          </p>
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-600">
          <span className="flex items-center gap-1">
            <Gauge className="size-3.5 text-petrol-500" /> {formatNumber(vehicle.mileage)} كم
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="size-3.5 text-petrol-500" /> {vehicle.fuelType}
          </span>
          <span className="flex items-center gap-1">
            <Cog className="size-3.5 text-petrol-500" /> {vehicle.transmission}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-600">
          <MapPin className="size-3.5 text-gold-500" /> {vehicle.locationCity} · {vehicle.locationCountry}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2.5">
          <span className="text-[11px] text-ink-600">
            قيمة السوق <span className="font-bold text-ink-950">{formatMoney(vehicle.retailValue)}</span>
          </span>
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-ink-950 hover:text-petrol-500"
          >
            التفاصيل <ArrowLeft className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
