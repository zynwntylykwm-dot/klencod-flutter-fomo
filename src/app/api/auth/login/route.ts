import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 422);

  const rows = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return fail("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }
  if (user.status !== "active") {
    return fail("هذا الحساب موقوف، يرجى التواصل مع الدعم", 403);
  }

  await createSession(user.id);
  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
