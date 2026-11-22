import { eq } from "drizzle-orm";

import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { vehicleSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;

  const parsed = vehicleSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات السيارة غير صالحة", 422, parsed.error.flatten().fieldErrors);

  const input = parsed.data;
  const duplicate = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.lotNumber, input.lotNumber)).limit(1);
  if (duplicate.length > 0) return fail("رقم اللوت مستخدم مسبقًا", 409);

  const inserted = await db
    .insert(vehicles)
    .values({
      lotNumber: input.lotNumber,
      vin: input.vin.toUpperCase(),
      make: input.make,
      model: input.model,
      trim: input.trim || null,
      year: input.year,
      mileage: input.mileage,
      fuelType: input.fuelType,
      transmission: input.transmission,
      bodyType: input.bodyType,
      color: input.color,
      condition: input.condition,
      runCondition: input.runCondition,
      damageType: input.damageType,
      damageDescription: input.damageDescription,
      keysPresent: input.keysPresent,
      titleStatus: input.titleStatus,
      seller: input.seller || "مزاد مرخّص",
      retailValue: input.retailValue,
      repairCost: input.repairCost,
      images: input.images,
      locationCity: input.locationCity,
      locationCountry: input.locationCountry,
      auctionId: input.auctionId ?? null,
      startingBid: input.startingBid,
      reservePrice: input.reservePrice ?? null,
      minIncrement: input.minIncrement,
      currentBid: input.startingBid,
      status: input.status,
      auctionStart: new Date(input.auctionStart),
      auctionEnd: new Date(input.auctionEnd),
    })
    .returning({ id: vehicles.id });

  return ok({ id: inserted[0]?.id }, { status: 201 });
}
