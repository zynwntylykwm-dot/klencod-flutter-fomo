import "server-only";

import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  auctions,
  bids,
  invoices,
  notifications,
  users,
  vehicles,
  type Auction,
  type Invoice,
  type Notification,
  type User,
  type Vehicle,
} from "@/db/schema";
import { settleAuctions } from "@/lib/auctions";

export async function getAdminOverview() {
  await ensureSeeded();
  await settleAuctions();
  const [userCount, liveCount, soldCount, bidCount, bidVolume, invoiceTotals, pendingInvoices, recentBids, recentUsers] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "user")),
      db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(eq(vehicles.status, "live")),
      db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(eq(vehicles.status, "sold")),
      db.select({ count: sql<number>`count(*)::int` }).from(bids),
      db.select({ sum: sql<number>`coalesce(sum(${bids.amount}), 0)::int` }).from(bids),
      db
        .select({
          paid: sql<number>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.total} else 0 end), 0)::int`,
          fees: sql<number>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.buyerFee} + ${invoices.docFee} else 0 end), 0)::int`,
        })
        .from(invoices),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(or(eq(invoices.status, "pending"), eq(invoices.status, "overdue"))),
      db
        .select({
          id: bids.id,
          amount: bids.amount,
          createdAt: bids.createdAt,
          bidderName: users.name,
          lotNumber: vehicles.lotNumber,
          make: vehicles.make,
          model: vehicles.model,
          year: vehicles.year,
          vehicleId: vehicles.id,
        })
        .from(bids)
        .innerJoin(users, eq(users.id, bids.userId))
        .innerJoin(vehicles, eq(vehicles.id, bids.vehicleId))
        .orderBy(desc(bids.createdAt))
        .limit(8),
      db
        .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, status: users.status })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(6),
    ]);
  return {
    stats: {
      users: userCount[0]?.count ?? 0,
      live: liveCount[0]?.count ?? 0,
      sold: soldCount[0]?.count ?? 0,
      bids: bidCount[0]?.count ?? 0,
      volume: bidVolume[0]?.sum ?? 0,
      collected: invoiceTotals[0]?.paid ?? 0,
      fees: invoiceTotals[0]?.fees ?? 0,
      pendingInvoices: pendingInvoices[0]?.count ?? 0,
    },
    recentBids,
    recentUsers,
  };
}

export type AdminVehicleRow = Vehicle & { auctionName: string | null };

export async function getAdminVehicles(query = ""): Promise<AdminVehicleRow[]> {
  await ensureSeeded();
  await settleAuctions();
  const conditions: SQL[] = [];
  if (query) {
    const term = `%${query}%`;
    const match = or(ilike(vehicles.lotNumber, term), ilike(vehicles.make, term), ilike(vehicles.model, term), ilike(vehicles.vin, term));
    if (match) conditions.push(match);
  }
  return db
    .select({
      id: vehicles.id,
      lotNumber: vehicles.lotNumber,
      vin: vehicles.vin,
      make: vehicles.make,
      model: vehicles.model,
      trim: vehicles.trim,
      year: vehicles.year,
      mileage: vehicles.mileage,
      fuelType: vehicles.fuelType,
      transmission: vehicles.transmission,
      bodyType: vehicles.bodyType,
      color: vehicles.color,
      condition: vehicles.condition,
      runCondition: vehicles.runCondition,
      damageType: vehicles.damageType,
      damageDescription: vehicles.damageDescription,
      keysPresent: vehicles.keysPresent,
      titleStatus: vehicles.titleStatus,
      seller: vehicles.seller,
      retailValue: vehicles.retailValue,
      repairCost: vehicles.repairCost,
      images: vehicles.images,
      locationCity: vehicles.locationCity,
      locationCountry: vehicles.locationCountry,
      auctionId: vehicles.auctionId,
      startingBid: vehicles.startingBid,
      reservePrice: vehicles.reservePrice,
      minIncrement: vehicles.minIncrement,
      currentBid: vehicles.currentBid,
      bidCount: vehicles.bidCount,
      status: vehicles.status,
      auctionStart: vehicles.auctionStart,
      auctionEnd: vehicles.auctionEnd,
      winnerId: vehicles.winnerId,
      winningBid: vehicles.winningBid,
      createdAt: vehicles.createdAt,
      updatedAt: vehicles.updatedAt,
      auctionName: auctions.name,
    })
    .from(vehicles)
    .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(vehicles.id))
    .limit(200);
}

export type AdminAuctionRow = Auction & { lotCount: number };

export async function getAdminAuctions(): Promise<AdminAuctionRow[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: auctions.id,
      name: auctions.name,
      code: auctions.code,
      location: auctions.location,
      country: auctions.country,
      startsAt: auctions.startsAt,
      endsAt: auctions.endsAt,
      status: auctions.status,
      description: auctions.description,
      createdAt: auctions.createdAt,
      lotCount: sql<number>`count(${vehicles.id})::int`,
    })
    .from(auctions)
    .leftJoin(vehicles, eq(vehicles.auctionId, auctions.id))
    .groupBy(auctions.id)
    .orderBy(desc(auctions.startsAt));
  return rows as AdminAuctionRow[];
}

export type AdminUserRow = Omit<User, "passwordHash"> & { bidCount: number; winCount: number };

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      status: users.status,
      country: users.country,
      city: users.city,
      company: users.company,
      bidderNumber: users.bidderNumber,
      notifyEmail: users.notifyEmail,
      notifySms: users.notifySms,
      notifyOutbid: users.notifyOutbid,
      notifyAuctions: users.notifyAuctions,
      createdAt: users.createdAt,
      bidCount: sql<number>`(select count(*)::int from ${bids} where ${bids.userId} = ${users.id})`,
      winCount: sql<number>`(select count(*)::int from ${vehicles} where ${vehicles.winnerId} = ${users.id})`,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
  return rows as AdminUserRow[];
}

export async function getAdminBids(limit = 120) {
  await ensureSeeded();
  return db
    .select({
      id: bids.id,
      amount: bids.amount,
      createdAt: bids.createdAt,
      bidderName: users.name,
      bidderEmail: users.email,
      vehicleId: vehicles.id,
      lotNumber: vehicles.lotNumber,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      vehicleStatus: vehicles.status,
    })
    .from(bids)
    .innerJoin(users, eq(users.id, bids.userId))
    .innerJoin(vehicles, eq(vehicles.id, bids.vehicleId))
    .orderBy(desc(bids.createdAt))
    .limit(limit);
}

export type AdminInvoiceRow = Invoice & { buyerName: string; buyerEmail: string };

export async function getAdminInvoices(): Promise<AdminInvoiceRow[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: invoices.id,
      number: invoices.number,
      userId: invoices.userId,
      vehicleId: invoices.vehicleId,
      lotNumber: invoices.lotNumber,
      vehicleLabel: invoices.vehicleLabel,
      hammerPrice: invoices.hammerPrice,
      buyerFee: invoices.buyerFee,
      docFee: invoices.docFee,
      shippingFee: invoices.shippingFee,
      total: invoices.total,
      status: invoices.status,
      method: invoices.method,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      createdAt: invoices.createdAt,
      buyerName: users.name,
      buyerEmail: users.email,
    })
    .from(invoices)
    .innerJoin(users, eq(users.id, invoices.userId))
    .orderBy(desc(invoices.createdAt));
  return rows as AdminInvoiceRow[];
}

export type AdminNotificationRow = Notification & { userName: string | null };

export async function getAdminNotifications(): Promise<AdminNotificationRow[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      title: notifications.title,
      body: notifications.body,
      type: notifications.type,
      link: notifications.link,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      userName: users.name,
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(80);
  return rows as AdminNotificationRow[];
}

export async function getAdminReport() {
  await ensureSeeded();
  await settleAuctions();
  const [byMonth, byDamage, byMake, totals] = await Promise.all([
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${vehicles.updatedAt}), 'YYYY-MM')`,
        sold: sql<number>`count(*)::int`,
        value: sql<number>`coalesce(sum(coalesce(${vehicles.winningBid}, ${vehicles.currentBid})), 0)::int`,
      })
      .from(vehicles)
      .where(eq(vehicles.status, "sold"))
      .groupBy(sql`date_trunc('month', ${vehicles.updatedAt})`)
      .orderBy(sql`date_trunc('month', ${vehicles.updatedAt})`),
    db
      .select({ label: vehicles.damageType, count: sql<number>`count(*)::int` })
      .from(vehicles)
      .groupBy(vehicles.damageType)
      .orderBy(desc(sql`count(*)`))
      .limit(6),
    db
      .select({
        make: vehicles.make,
        count: sql<number>`count(*)::int`,
        avgBid: sql<number>`coalesce(round(avg(${vehicles.currentBid})), 0)::int`,
      })
      .from(vehicles)
      .groupBy(vehicles.make)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db
      .select({
        lots: sql<number>`count(*)::int`,
        live: sql<number>`count(*) filter (where ${vehicles.status} = 'live')::int`,
        sold: sql<number>`count(*) filter (where ${vehicles.status} = 'sold')::int`,
        avgWinning: sql<number>`coalesce(round(avg(${vehicles.winningBid})), 0)::int`,
        retail: sql<number>`coalesce(sum(${vehicles.retailValue}), 0)::int`,
      })
      .from(vehicles),
  ]);
  return {
    byMonth,
    byDamage,
    byMake,
    totals: totals[0] ?? { lots: 0, live: 0, sold: 0, avgWinning: 0, retail: 0 },
  };
}

export type AdminWinnerRow = {
  vehicleId: number;
  lotNumber: string;
  vehicleLabel: string;
  winningBid: number | null;
  winnerName: string | null;
  winnerEmail: string | null;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  invoiceTotal: number | null;
  settledAt: Date;
};

export async function getAdminWinners(): Promise<AdminWinnerRow[]> {
  await ensureSeeded();
  const rows = await db
    .select({
      vehicleId: vehicles.id,
      lotNumber: vehicles.lotNumber,
      year: vehicles.year,
      make: vehicles.make,
      model: vehicles.model,
      winningBid: vehicles.winningBid,
      winnerName: users.name,
      winnerEmail: users.email,
      invoiceNumber: invoices.number,
      invoiceStatus: invoices.status,
      invoiceTotal: invoices.total,
      settledAt: vehicles.updatedAt,
    })
    .from(vehicles)
    .leftJoin(users, eq(users.id, vehicles.winnerId))
    .leftJoin(invoices, eq(invoices.vehicleId, vehicles.id))
    .where(eq(vehicles.status, "sold"))
    .orderBy(desc(vehicles.updatedAt))
    .limit(60);
  return rows.map((row) => ({
    vehicleId: row.vehicleId,
    lotNumber: row.lotNumber,
    vehicleLabel: `${row.year} ${row.make} ${row.model}`,
    winningBid: row.winningBid,
    winnerName: row.winnerName,
    winnerEmail: row.winnerEmail,
    invoiceNumber: row.invoiceNumber,
    invoiceStatus: row.invoiceStatus,
    invoiceTotal: row.invoiceTotal,
    settledAt: row.settledAt,
  }));
}
