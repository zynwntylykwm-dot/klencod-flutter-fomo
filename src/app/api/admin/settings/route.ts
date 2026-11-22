import { eq } from "drizzle-orm";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { settingsSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const parsed = settingsSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "إعدادات غير صالحة", 422);
  await db
    .insert(settings)
    .values({ id: 1, ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.id, set: { ...parsed.data, updatedAt: new Date() } });
  const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return ok({ settings: rows[0] });
}
