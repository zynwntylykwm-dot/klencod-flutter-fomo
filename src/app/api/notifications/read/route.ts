import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { guardUser } from "@/lib/http";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, guard.user.id), isNull(notifications.readAt)));
  return ok({ read: true });
}
