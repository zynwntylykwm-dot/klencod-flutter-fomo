import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { bids, notifications, users, vehicles } from "@/db/schema";
import { antiSnipingEnd, settleAuctions } from "@/lib/auctions";
import { guardUser } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { bidSchema } from "@/lib/validation";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function snapshot(vehicleId: number) {
  const rows = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  const vehicle = rows[0];
  if (!vehicle) return null;
  const history = await db
    .select({ id: bids.id, amount: bids.amount, createdAt: bids.createdAt, userId: bids.userId, bidderNumber: users.bidderNumber })
    .from(bids)
    .innerJoin(users, eq(users.id, bids.userId))
    .where(eq(bids.vehicleId, vehicleId))
    .orderBy(desc(bids.amount), desc(bids.createdAt))
    .limit(20);
  return {
    currentBid: vehicle.currentBid,
    bidCount: vehicle.bidCount,
    minIncrement: vehicle.minIncrement,
    status: vehicle.status,
    auctionEnd: vehicle.auctionEnd.toISOString(),
    auctionStart: vehicle.auctionStart.toISOString(),
    winningBid: vehicle.winningBid,
    winnerId: vehicle.winnerId,
    reservePrice: vehicle.reservePrice,
    bids: history.map((row) => ({
      id: row.id,
      amount: row.amount,
      createdAt: row.createdAt.toISOString(),
      alias: `مزايد #${row.bidderNumber.replace("MN-", "").slice(-4)}`,
      isYou: false,
    })),
  };
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) return fail("رقم اللوت غير صالح", 422);
  await settleAuctions();
  const data = await snapshot(vehicleId);
  if (!data) return fail("اللوت غير موجود", 404);
  return ok(data);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) return fail("رقم اللوت غير صالح", 422);

  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  const user = guard.user;

  const body = await readJson(request);
  const parsed = bidSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "قيمة المزايدة غير صالحة", 422);
  const amount = parsed.data.amount;

  try {
    const result = await db.transaction(async (tx) => {
      const locked = await tx.select().from(vehicles).where(eq(vehicles.id, vehicleId)).for("update").limit(1);
      const vehicle = locked[0];
      if (!vehicle) throw new BidError("اللوت غير موجود", 404);

      const now = new Date();
      if (vehicle.status !== "live") {
        throw new BidError("المزايدة غير متاحة: هذا اللوت ليس في مزاد نشط", 409);
      }
      if (new Date(vehicle.auctionEnd).getTime() <= now.getTime()) {
        throw new BidError("انتهى وقت المزاد على هذا اللوت", 409);
      }
      const minimum = Math.max(vehicle.currentBid, vehicle.startingBid) + vehicle.minIncrement;
      if (amount < minimum) {
        throw new BidError(`المبلغ أقل من الحد الأدنى المقبول (${formatMoney(minimum)})`, 409);
      }

      const top = await tx
        .select({ userId: bids.userId, amount: bids.amount })
        .from(bids)
        .where(eq(bids.vehicleId, vehicleId))
        .orderBy(desc(bids.amount), desc(bids.createdAt))
        .limit(1);

      if (top[0]?.userId === user.id) {
        throw new BidError("أنت الأعلى مزايدة بالفعل على هذا اللوت", 409);
      }

      const { auctionEnd, extended } = antiSnipingEnd(vehicle.auctionEnd, now);

      await tx.insert(bids).values({ vehicleId, userId: user.id, amount, createdAt: now });
      await tx
        .update(vehicles)
        .set({
          currentBid: amount,
          bidCount: vehicle.bidCount + 1,
          auctionEnd,
          updatedAt: now,
        })
        .where(eq(vehicles.id, vehicleId));

      if (top[0]) {
        const previous = await tx
          .select({ notifyOutbid: users.notifyOutbid })
          .from(users)
          .where(eq(users.id, top[0].userId))
          .limit(1);
        if (previous[0]?.notifyOutbid !== false) {
          await tx.insert(notifications).values({
            userId: top[0].userId,
            title: "تم تجاوز مزايدتك",
            body: `تم تجاوز مزايدتك على اللوت ${vehicle.lotNumber} (${vehicle.year} ${vehicle.make} ${vehicle.model}) بمزايدة جديدة. أعلى مزايدة الآن ${formatMoney(amount)}.`,
            type: "bid",
            link: `/vehicles/${vehicleId}`,
          });
        }
      }

      await tx.insert(notifications).values({
        userId: user.id,
        title: extended ? "تم تمديد المزاد بعد مزايدتك" : "تم تسجيل مزايدتك",
        body: extended
          ? `مزايدتك بمبلغ ${formatMoney(amount)} على اللوت ${vehicle.lotNumber} سُجّلت، وتم تمديد المزاد دقيقتين إضافيتين.`
          : `مزايدتك بمبلغ ${formatMoney(amount)} على اللوت ${vehicle.lotNumber} هي الأعلى حاليًا.`,
        type: "bid",
        link: `/vehicles/${vehicleId}`,
      });

      return { extended, currentBid: amount, bidCount: vehicle.bidCount + 1, auctionEnd: auctionEnd.toISOString() };
    });

    const data = await snapshot(vehicleId);
    return ok({ ...data, extended: result.extended });
  } catch (error) {
    if (error instanceof BidError) return fail(error.message, error.status);
    console.error("[bids] failed", error);
    return fail("تعذّر تسجيل المزايدة، حاول مرة أخرى", 500);
  }
}

class BidError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
