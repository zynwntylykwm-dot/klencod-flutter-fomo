import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { guardAdmin } from "@/lib/http";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({ status: z.enum(["pending", "paid", "overdue", "cancelled"]) });

export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isFinite(invoiceId)) return fail("رقم الفاتورة غير صالح", 422);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("حالة الفاتورة غير صالحة", 422);
  await db
    .update(invoices)
    .set({
      status: parsed.data.status,
      paidAt: parsed.data.status === "paid" ? new Date() : null,
      method: parsed.data.status === "paid" ? "تسوية إدارية" : null,
    })
    .where(eq(invoices.id, invoiceId));
  return ok({ updated: true });
}
