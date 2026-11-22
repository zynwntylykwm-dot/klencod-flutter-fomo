import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, makeBidderNumber } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";
import { registerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 422);

  const { name, email, password, phone, country, city } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return fail("هذا البريد الإلكتروني مسجّل مسبقًا، يمكنك تسجيل الدخول", 409);

  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      phone: phone || null,
      country: country || "الولايات المتحدة",
      city: city || null,
      role: "user",
      bidderNumber: "MN-000000",
    })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  const user = inserted[0];
  if (!user) return fail("تعذّر إنشاء الحساب", 500);

  const bidderNumber = makeBidderNumber(user.id);
  await db.update(users).set({ bidderNumber }).where(eq(users.id, user.id));
  await createSession(user.id);

  return ok({ user: { ...user, bidderNumber } }, { status: 201 });
}
