import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { vehicles, watchlist } from "@/db/schema";
import { guardUser } from "@/lib/http";
import { fail, ok, readJson, toInt } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  const body = await readJson(request);
  const vehicleId = toInt(body.vehicleId);
  if (!vehicleId) return fail("رقم اللوت غير صالح", 422);

  const vehicle = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  if (vehicle.length === 0) return fail("اللوت غير موجود", 404);

  const existing = await db
    .select({ id: watchlist.id })
    .from(watchlist)
    .where(and(eq(watchlist.userId, guard.user.id), eq(watchlist.vehicleId, vehicleId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(watchlist).where(eq(watchlist.id, existing[0].id));
  } else {
    await db.insert(watchlist).values({ userId: guard.user.id, vehicleId }).onConflictDoNothing();
  }

  const counts = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(watchlist)
    .where(eq(watchlist.userId, guard.user.id));

  return ok({ watched: existing.length === 0, count: counts[0]?.count ?? 0 });
}
