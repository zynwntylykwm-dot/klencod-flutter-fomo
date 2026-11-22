import "server-only";

import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  auctions,
  bids,
  invoices,
  notifications,
  settings,
  users,
  vehicles,
  watchlist,
  type Auction,
  type Vehicle,
} from "@/db/schema";
import { settleAuctions } from "@/lib/auctions";
import { PAGE_SIZE } from "@/lib/constants";
import type { VehicleFilters } from "@/lib/filters";

export type VehicleRow = Vehicle & { auctionName: string | null; auctionCode: string | null };

const vehicleSelection = {
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
  auctionCode: auctions.code,
};

function buildConditions(filters: VehicleFilters, forcedStatus?: string): SQL[] {
  const conditions: SQL[] = [];
  const status = forcedStatus ?? filters.status;
  if (status) conditions.push(eq(vehicles.status, status));
  if (filters.q) {
    const term = `%${filters.q}%`;
    const search = or(
      ilike(vehicles.make, term),
      ilike(vehicles.model, term),
      ilike(vehicles.lotNumber, term),
      ilike(vehicles.vin, term),
      ilike(vehicles.trim, term),
    );
    if (search) conditions.push(search);
  }
  if (filters.make) conditions.push(eq(vehicles.make, filters.make));
  if (filters.model) conditions.push(ilike(vehicles.model, `%${filters.model}%`));
  if (filters.bodyType) conditions.push(eq(vehicles.bodyType, filters.bodyType));
  if (filters.fuelType) conditions.push(eq(vehicles.fuelType, filters.fuelType));
  if (filters.transmission) conditions.push(eq(vehicles.transmission, filters.transmission));
  if (filters.condition) conditions.push(eq(vehicles.condition, filters.condition));
  if (filters.damageType) conditions.push(eq(vehicles.damageType, filters.damageType));
  if (filters.locationCountry) conditions.push(eq(vehicles.locationCountry, filters.locationCountry));
  if (filters.locationCity) conditions.push(ilike(vehicles.locationCity, `%${filters.locationCity}%`));
  if (filters.vin) conditions.push(ilike(vehicles.vin, `%${filters.vin}%`));
  if (filters.lot) conditions.push(ilike(vehicles.lotNumber, `%${filters.lot}%`));
  if (filters.auctionId) conditions.push(eq(vehicles.auctionId, Number(filters.auctionId)));
  const yearFrom = Number(filters.yearFrom);
  const yearTo = Number(filters.yearTo);
  if (Number.isFinite(yearFrom) && filters.yearFrom) conditions.push(gte(vehicles.year, yearFrom));
  if (Number.isFinite(yearTo) && filters.yearTo) conditions.push(lte(vehicles.year, yearTo));
  const priceFrom = Number(filters.priceFrom);
  const priceTo = Number(filters.priceTo);
  const priceExpression = sql`greatest(${vehicles.currentBid}, ${vehicles.startingBid})`;
  if (Number.isFinite(priceFrom) && filters.priceFrom) conditions.push(sql`${priceExpression} >= ${priceFrom}`);
  if (Number.isFinite(priceTo) && filters.priceTo) conditions.push(sql`${priceExpression} <= ${priceTo}`);
  return conditions;
}

function orderFor(sort: string) {
  switch (sort) {
    case "newest":
      return [desc(vehicles.createdAt)];
    case "price-asc":
      return [asc(sql`greatest(${vehicles.currentBid}, ${vehicles.startingBid})`)];
    case "price-desc":
      return [desc(sql`greatest(${vehicles.currentBid}, ${vehicles.startingBid})`)];
    case "year-desc":
      return [desc(vehicles.year)];
    default:
      return [asc(vehicles.auctionEnd), desc(vehicles.id)];
  }
}

export async function searchVehicles(
  filters: VehicleFilters,
  forcedStatus?: string,
): Promise<{ rows: VehicleRow[]; total: number; page: number; pages: number }> {
  await ensureSeeded();
  await settleAuctions();
  const where = and(...buildConditions(filters, forcedStatus));
  const page = Math.max(1, filters.page);
  const [rows, countRows] = await Promise.all([
    db
      .select(vehicleSelection)
      .from(vehicles)
      .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
      .where(where)
      .orderBy(...orderFor(filters.sort))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(where),
  ]);
  const total = countRows[0]?.count ?? 0;
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getVehicleById(id: number): Promise<VehicleRow | null> {
  await ensureSeeded();
  await settleAuctions();
  const rows = await db
    .select(vehicleSelection)
    .from(vehicles)
    .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
    .where(eq(vehicles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type BidRow = {
  id: number;
  amount: number;
  createdAt: Date;
  bidderName: string;
  bidderNumber: string;
  userId: number;
};

export async function getBidHistory(vehicleId: number, limit = 25): Promise<BidRow[]> {
  return db
    .select({
      id: bids.id,
      amount: bids.amount,
      createdAt: bids.createdAt,
      bidderName: users.name,
      bidderNumber: users.bidderNumber,
      userId: users.id,
    })
    .from(bids)
    .innerJoin(users, eq(users.id, bids.userId))
    .where(eq(bids.vehicleId, vehicleId))
    .orderBy(desc(bids.amount), desc(bids.createdAt))
    .limit(limit);
}

export async function getRelatedVehicles(vehicle: VehicleRow, limit = 3): Promise<VehicleRow[]> {
  return db
    .select(vehicleSelection)
    .from(vehicles)
    .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
    .where(
      and(
        sql`${vehicles.id} <> ${vehicle.id}`,
        inArray(vehicles.status, ["live", "upcoming"]),
        or(eq(vehicles.bodyType, vehicle.bodyType), eq(vehicles.make, vehicle.make)),
      ),
    )
    .orderBy(asc(vehicles.auctionEnd))
    .limit(limit);
}

export async function isWatched(userId: number | undefined, vehicleId: number): Promise<boolean> {
  if (!userId) return false;
  const rows = await db
    .select({ id: watchlist.id })
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.vehicleId, vehicleId)))
    .limit(1);
  return rows.length > 0;
}

export async function getWatchlistIds(userId: number | undefined): Promise<number[]> {
  if (!userId) return [];
  const rows = await db.select({ vehicleId: watchlist.vehicleId }).from(watchlist).where(eq(watchlist.userId, userId));
  return rows.map((row) => row.vehicleId);
}

export async function getWatchlistVehicles(userId: number): Promise<VehicleRow[]> {
  await ensureSeeded();
  await settleAuctions();
  return db
    .select(vehicleSelection)
    .from(watchlist)
    .innerJoin(vehicles, eq(vehicles.id, watchlist.vehicleId))
    .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
    .where(eq(watchlist.userId, userId))
    .orderBy(asc(vehicles.auctionEnd));
}

export async function getHomeData() {
  await ensureSeeded();
  await settleAuctions();
  const [live, upcoming, soldCount, brandCount, valueRow, endingSoon, upcomingAuctions, topMakes, liveTotal] = await Promise.all([
    db
      .select(vehicleSelection)
      .from(vehicles)
      .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
      .where(eq(vehicles.status, "live"))
      .orderBy(asc(vehicles.auctionEnd))
      .limit(8),
    db
      .select(vehicleSelection)
      .from(vehicles)
      .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
      .where(eq(vehicles.status, "upcoming"))
      .orderBy(asc(vehicles.auctionStart))
      .limit(4),
    db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(eq(vehicles.status, "sold")),
    db.select({ count: sql<number>`count(distinct ${vehicles.make})::int` }).from(vehicles),
    db.select({ total: sql<number>`coalesce(sum(${vehicles.currentBid}), 0)::int` }).from(vehicles).where(eq(vehicles.status, "live")),
    db
      .select(vehicleSelection)
      .from(vehicles)
      .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
      .where(eq(vehicles.status, "live"))
      .orderBy(asc(vehicles.auctionEnd))
      .limit(4),
    db
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
        lotCount: sql<number>`count(${vehicles.id})::int`,
        minBid: sql<number>`coalesce(min(${vehicles.startingBid}), 0)::int`,
      })
      .from(auctions)
      .leftJoin(vehicles, eq(vehicles.auctionId, auctions.id))
      .where(inArray(auctions.status, ["live", "upcoming"]))
      .groupBy(auctions.id)
      .orderBy(asc(auctions.startsAt))
      .limit(4),
    db
      .select({ make: vehicles.make, count: sql<number>`count(*)::int` })
      .from(vehicles)
      .groupBy(vehicles.make)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db.select({ count: sql<number>`count(*)::int` }).from(vehicles).where(eq(vehicles.status, "live")),
  ]);

  return {
    live: live as VehicleRow[],
    upcoming: upcoming as VehicleRow[],
    endingSoon: endingSoon as VehicleRow[],
    upcomingAuctions,
    topMakes,
    stats: {
      liveCount: liveTotal[0]?.count ?? live.length,
      soldCount: soldCount[0]?.count ?? 0,
      brandCount: brandCount[0]?.count ?? 0,
      liveValue: valueRow[0]?.total ?? 0,
    },
  };
}

export type AuctionWithStats = Auction & { lotCount: number; minBid: number; maxBid: number };

export async function getAuctionsByStatus(status: "live" | "upcoming" | "ended"): Promise<AuctionWithStats[]> {
  await ensureSeeded();
  await settleAuctions();
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
      minBid: sql<number>`coalesce(min(${vehicles.startingBid}), 0)::int`,
      maxBid: sql<number>`coalesce(max(${vehicles.currentBid}), 0)::int`,
    })
    .from(auctions)
    .leftJoin(vehicles, eq(vehicles.auctionId, auctions.id))
    .where(eq(auctions.status, status))
    .groupBy(auctions.id)
    .orderBy(asc(auctions.startsAt));
  return rows as AuctionWithStats[];
}

export async function getLiveAuctionLots(): Promise<VehicleRow[]> {
  await ensureSeeded();
  await settleAuctions();
  return db
    .select(vehicleSelection)
    .from(vehicles)
    .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
    .where(eq(vehicles.status, "live"))
    .orderBy(asc(vehicles.auctionEnd))
    .limit(24);
}

export async function getUserBids(userId: number) {
  await ensureSeeded();
  return db
    .select({
      id: bids.id,
      amount: bids.amount,
      createdAt: bids.createdAt,
      vehicleId: vehicles.id,
      lotNumber: vehicles.lotNumber,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      images: vehicles.images,
      status: vehicles.status,
      currentBid: vehicles.currentBid,
      winnerId: vehicles.winnerId,
      auctionEnd: vehicles.auctionEnd,
    })
    .from(bids)
    .innerJoin(vehicles, eq(vehicles.id, bids.vehicleId))
    .where(eq(bids.userId, userId))
    .orderBy(desc(bids.createdAt))
    .limit(60);
}

export async function getUserDashboard(userId: number) {
  await ensureSeeded();
  await settleAuctions();
  const [bidRows, watchRows, invoiceRows, notificationRows, winningRows] = await Promise.all([
    getUserBids(userId),
    db.select({ count: sql<number>`count(*)::int` }).from(watchlist).where(eq(watchlist.userId, userId)),
    db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt)).limit(5),
    db
      .select()
      .from(notifications)
      .where(or(eq(notifications.userId, userId), isNull(notifications.userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(6),
    db
      .select(vehicleSelection)
      .from(vehicles)
      .leftJoin(auctions, eq(auctions.id, vehicles.auctionId))
      .where(eq(vehicles.winnerId, userId))
      .orderBy(desc(vehicles.updatedAt)),
  ]);
  const uniqueLots = new Set(bidRows.map((row) => row.vehicleId));
  const leading = bidRows.filter((row) => row.status === "live" && row.currentBid === row.amount).length;
  const paidTotal = invoiceRows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.total, 0);
  const dueTotal = invoiceRows.filter((row) => row.status !== "paid").reduce((sum, row) => sum + row.total, 0);
  return {
    bids: bidRows,
    recentBids: bidRows.slice(0, 6),
    watchCount: watchRows[0]?.count ?? 0,
    invoices: invoiceRows,
    notifications: notificationRows,
    wins: winningRows as VehicleRow[],
    stats: {
      totalBids: bidRows.length,
      lotsBid: uniqueLots.size,
      leading,
      paidTotal,
      dueTotal,
    },
  };
}

export async function getUserInvoices(userId: number) {
  await ensureSeeded();
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function getUserNotifications(userId: number, limit = 50) {
  await ensureSeeded();
  return db
    .select()
    .from(notifications)
    .where(or(eq(notifications.userId, userId), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getPlatformSettings() {
  await ensureSeeded();
  const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return (
    rows[0] ?? {
      id: 1,
      buyerFeePercent: 8,
      minBuyerFee: 200,
      docFee: 79,
      sellerCommissionPercent: 5,
      defaultIncrement: 100,
      paymentDueDays: 5,
      updatedAt: new Date(),
    }
  );
}
