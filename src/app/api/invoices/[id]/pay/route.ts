import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { invoices, notifications } from "@/db/schema";
import { guardUser } from "@/lib/http";
import { fail, ok } from "@/lib/http";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const guard = await guardUser();
  if ("response" in guard) return guard.response;
  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isFinite(invoiceId)) return fail("رقم الفاتورة غير صالح", 422);

  const where =
    guard.user.role === "admin"
      ? eq(invoices.id, invoiceId)
      : and(eq(invoices.id, invoiceId), eq(invoices.userId, guard.user.id));
  const rows = await db.select().from(invoices).where(where).limit(1);
  const invoice = rows[0];
  if (!invoice) return fail("الفاتورة غير موجودة", 404);
  if (invoice.status === "paid") return fail("الفاتورة مدفوعة بالفعل", 409);

  await db
    .update(invoices)
    .set({ status: "paid", paidAt: new Date(), method: "بوابة دفع تجريبية" })
    .where(eq(invoices.id, invoiceId));

  await db.insert(notifications).values({
    userId: invoice.userId,
    title: "تم استلام الدفعة",
    body: `تم تسجيل سداد الفاتورة ${invoice.number} بمبلغ ${formatMoney(invoice.total)}. سيتم تجهيز مستندات التسليم خلال ٢٤ ساعة.`,
    type: "payment",
    link: "/dashboard/payments",
  });

  return ok({ paid: true, number: invoice.number });
}
