import { eq } from "drizzle-orm";

import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";
import { notificationSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const parsed = notificationSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "بيانات الإشعار غير صالحة", 422);
  const input = parsed.data;

  if (input.userId) {
    const target = await db.select({ id: users.id }).from(users).where(eq(users.id, input.userId)).limit(1);
    if (target.length === 0) return fail("المستخدم غير موجود", 404);
    await db.insert(notifications).values({
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      link: input.link || null,
    });
    return ok({ sent: 1 }, { status: 201 });
  }

  const recipients = await db.select({ id: users.id }).from(users).where(eq(users.status, "active"));
  if (recipients.length > 0) {
    await db.insert(notifications).values(
      recipients.map((user) => ({
        userId: user.id,
        title: input.title,
        body: input.body,
        type: input.type,
        link: input.link || null,
      })),
    );
  }
  return ok({ sent: recipients.length }, { status: 201 });
}
