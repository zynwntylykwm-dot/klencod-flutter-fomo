import { eq } from "drizzle-orm";

import { db } from "@/db";
import { auctions } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { auctionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const auctionId = Number(id);
  if (!Number.isFinite(auctionId)) return fail("رقم المزاد غير صالح", 422);
  const parsed = auctionSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات المزاد غير صالحة", 422);
  const input = parsed.data;
  await db
    .update(auctions)
    .set({
      name: input.name,
      code: input.code.toUpperCase(),
      location: input.location,
      country: input.country,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      status: input.status,
      description: input.description || null,
    })
    .where(eq(auctions.id, auctionId));
  return ok({ updated: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const auctionId = Number(id);
  if (!Number.isFinite(auctionId)) return fail("رقم المزاد غير صالح", 422);
  await db.delete(auctions).where(eq(auctions.id, auctionId));
  return ok({ deleted: true });
}
