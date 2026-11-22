import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isFinite(userId)) return fail("رقم المستخدم غير صالح", 422);
  if (userId === guard.user.id) return fail("لا يمكنك تغيير صلاحيات حسابك الحالي", 400);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("بيانات غير صالحة", 422);
  if (!parsed.data.role && !parsed.data.status) return fail("لا يوجد تغيير مطلوب", 422);

  await db
    .update(users)
    .set({ ...(parsed.data.role ? { role: parsed.data.role } : {}), ...(parsed.data.status ? { status: parsed.data.status } : {}) })
    .where(eq(users.id, userId));

  return ok({ updated: true });
}
