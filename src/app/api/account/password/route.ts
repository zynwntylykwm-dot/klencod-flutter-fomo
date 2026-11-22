import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { guardUser } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { passwordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  const parsed = passwordSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 422);
  const rows = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, guard.user.id)).limit(1);
  const current = rows[0];
  if (!current || !verifyPassword(parsed.data.currentPassword, current.passwordHash)) {
    return fail("كلمة المرور الحالية غير صحيحة", 401);
  }
  await db.update(users).set({ passwordHash: hashPassword(parsed.data.newPassword) }).where(eq(users.id, guard.user.id));
  return ok({ updated: true });
}
