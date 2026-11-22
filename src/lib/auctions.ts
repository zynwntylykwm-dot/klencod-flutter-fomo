import "server-only";

import { and, asc, desc, eq, inArray, lte, ne } from "drizzle-orm";

import { db } from "@/db";
import { auctions, bids, invoices, notifications, settings, vehicles } from "@/db/schema";

let lastSettleRun = 0;

/**
 * Closes every lot whose countdown has finished, picks the winner,
 * issues the invoice and notifies the parties. Safe to call on every request;
 * internally throttled and wrapped in a row-level lock per vehicle.
 */
export async function settleAuctions(force = false): Promise<void> {
  if (!force && Date.now() - lastSettleRun < 10_000) return;
  lastSettleRun = Date.now();
  const now = new Date();
  try {
    await db
      .update(vehicles)
      .set({ status: "live" })
      .where(and(eq(vehicles.status, "upcoming"), lte(vehicles.auctionStart, now)));
    await db
      .update(auctions)
      .set({ status: "live" })
      .where(and(eq(auctions.status, "upcoming"), lte(auctions.startsAt, now)));

    const due = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(and(inArray(vehicles.status, ["live", "upcoming"]), lte(vehicles.auctionEnd, now)))
      .limit(60);

    for (const row of due) {
      await closeVehicle(row.id);
    }

    await db
      .update(auctions)
      .set({ status: "ended" })
      .where(and(ne(auctions.status, "ended"), lte(auctions.endsAt, now)));
  } catch (error) {
    console.error("[auctions] settle failed", error);
  }
}

async function closeVehicle(vehicleId: number): Promise<void> {
  await db.transaction(async (tx) => {
    const locked = await tx
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, vehicleId))
      .for("update")
      .limit(1);
    const vehicle = locked[0];
    if (!vehicle) return;
    if (vehicle.status !== "live" && vehicle.status !== "upcoming") return;
    if (new Date(vehicle.auctionEnd).getTime() > Date.now()) return;

    const top = await tx
      .select({ userId: bids.userId, amount: bids.amount })
      .from(bids)
      .where(eq(bids.vehicleId, vehicleId))
      .orderBy(desc(bids.amount), asc(bids.createdAt))
      .limit(1);
    const winner = top[0];

    if (!winner || (vehicle.reservePrice && winner.amount < vehicle.reservePrice)) {
      await tx.update(vehicles).set({ status: "ended", updatedAt: new Date() }).where(eq(vehicles.id, vehicleId));
      return;
    }

    const configRows = await tx.select().from(settings).where(eq(settings.id, 1)).limit(1);
    const config = configRows[0];
    const buyerFee = Math.max(
      config?.minBuyerFee ?? 200,
      Math.round((winner.amount * (config?.buyerFeePercent ?? 8)) / 100),
    );
    const docFee = config?.docFee ?? 79;

    await tx
      .update(vehicles)
      .set({
        status: "sold",
        winnerId: winner.userId,
        winningBid: winner.amount,
        currentBid: winner.amount,
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, vehicleId));

    const existing = await tx.select({ id: invoices.id }).from(invoices).where(eq(invoices.vehicleId, vehicleId)).limit(1);
    if (existing.length === 0) {
      await tx.insert(invoices).values({
        number: `INV-${new Date().getFullYear()}-${String(5000 + vehicleId)}`,
        userId: winner.userId,
        vehicleId,
        lotNumber: vehicle.lotNumber,
        vehicleLabel: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        hammerPrice: winner.amount,
        buyerFee,
        docFee,
        total: winner.amount + buyerFee + docFee,
        status: "pending",
        dueDate: new Date(Date.now() + (config?.paymentDueDays ?? 5) * 24 * 60 * 60 * 1000),
      });
    }

    await tx.insert(notifications).values({
      userId: winner.userId,
      title: "🎉 مبروك، لقد فزت بالمزاد",
      body: `فزت باللوت ${vehicle.lotNumber} (${vehicle.year} ${vehicle.make} ${vehicle.model}) بمبلغ ${winner.amount.toLocaleString("en-US")} دولار. تم إصدار فاتورة باسمك.`,
      type: "win",
      link: "/dashboard/payments",
    });
  });
}

/** Extends a live lot by 2 minutes if a bid lands in the final 2 minutes (anti-sniping). */
export function antiSnipingEnd(auctionEnd: Date, now = new Date()): { auctionEnd: Date; extended: boolean } {
  const remaining = new Date(auctionEnd).getTime() - now.getTime();
  if (remaining > 0 && remaining < 120_000) {
    return { auctionEnd: new Date(now.getTime() + 120_000), extended: true };
  }
  return { auctionEnd: new Date(auctionEnd), extended: false };
}
