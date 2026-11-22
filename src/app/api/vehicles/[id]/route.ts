import { eq } from "drizzle-orm";

import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { vehicleSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) return fail("رقم اللوت غير صالح", 422);

  const parsed = vehicleSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات السيارة غير صالحة", 422, parsed.error.flatten().fieldErrors);
  const input = parsed.data;

  const existing = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  if (existing.length === 0) return fail("اللوت غير موجود", 404);

  await db
    .update(vehicles)
    .set({
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
      status: input.status,
      auctionStart: new Date(input.auctionStart),
      auctionEnd: new Date(input.auctionEnd),
      updatedAt: new Date(),
    })
    .where(eq(vehicles.id, vehicleId));

  return ok({ id: vehicleId, updated: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) return fail("رقم اللوت غير صالح", 422);
  await db.delete(vehicles).where(eq(vehicles.id, vehicleId));
  return ok({ deleted: true });
}
