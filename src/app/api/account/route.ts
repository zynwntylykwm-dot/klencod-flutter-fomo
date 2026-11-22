import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { guardUser } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { profileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  const parsed = profileSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 422);
  const input = parsed.data;
  await db
    .update(users)
    .set({
      name: input.name,
      phone: input.phone || null,
      country: input.country || null,
      city: input.city || null,
      company: input.company || null,
      ...(input.notifyEmail === undefined ? {} : { notifyEmail: input.notifyEmail }),
      ...(input.notifySms === undefined ? {} : { notifySms: input.notifySms }),
      ...(input.notifyOutbid === undefined ? {} : { notifyOutbid: input.notifyOutbid }),
      ...(input.notifyAuctions === undefined ? {} : { notifyAuctions: input.notifyAuctions }),
    })
    .where(eq(users.id, guard.user.id));
  return ok({ updated: true });
}
