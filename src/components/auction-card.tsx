import Link from "next/link";
import { ArrowLeft, CalendarDays, Gavel, MapPin } from "lucide-react";

import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui";
import { AUCTION_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";


type AuctionCardData = {
  id: number;
  name: string;
  code: string;
  location: string;
  country: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  lotCount: number;
  minBid: number;
};

export function AuctionCard({ auction }: { auction: AuctionCardData }) {
  const tone = auction.status === "live" ? "live" : auction.status === "upcoming" ? "upcoming" : "ended";
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="hero-mesh flex items-start justify-between gap-2 px-4 py-3 text-white">
        <div>
          <p dir="ltr" className="text-[10px] font-extrabold tracking-widest text-gold-400">{auction.code}</p>
          <h3 className="mt-0.5 text-base font-extrabold leading-snug">{auction.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-cream-200/70">
            <MapPin className="size-3" /> {auction.location} · {auction.country}
          </p>
        </div>
        <Badge tone={tone}>{AUCTION_STATUS_LABELS[auction.status] ?? auction.status}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-ink-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5 text-petrol-500" /> {formatDateTime(auction.startsAt)}
          </span>
          <span className="font-bold text-ink-950">{formatNumber(auction.lotCount)} لوت</span>
        </div>
        <p className="text-[11px] text-ink-600">الحد الأدنى للبدء: <span className="font-bold text-ink-950">{formatMoney(auction.minBid)}</span></p>
        <div className="rounded-lg bg-cream-100 p-2.5">
          <Countdown end={auction.endsAt.toISOString()} start={auction.startsAt.toISOString()} status={auction.status} tone="light" />
        </div>
        <Link href={`/vehicles?auctionId=${auction.id}`} className="btn btn-outline mt-auto w-full justify-between text-xs">
          <span className="flex items-center gap-1.5"><Gavel className="size-3.5" /> عرض لوتات المزاد</span>
          <ArrowLeft className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
