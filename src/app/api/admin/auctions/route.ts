import { db } from "@/db";
import { auctions } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { auctionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const parsed = auctionSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات المزاد غير صالحة", 422);
  const input = parsed.data;
  if (new Date(input.endsAt) <= new Date(input.startsAt)) return fail("وقت الانتهاء يجب أن يكون بعد وقت البداية", 422);
  const inserted = await db
    .insert(auctions)
    .values({
      name: input.name,
      code: input.code.toUpperCase(),
      location: input.location,
      country: input.country,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      status: input.status,
      description: input.description || null,
    })
    .returning({ id: auctions.id });
  return ok({ id: inserted[0]?.id }, { status: 201 });
}
