import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { SettingsForm } from "@/components/settings-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إعدادات الحساب" };

export default async function SettingsPage() {
  const user = await requireUser("/dashboard/settings");
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <h1 className="text-sm font-extrabold text-ink-950">إدارة الحساب والإعدادات</h1>
          <p className="mt-0.5 text-[11px] text-ink-600">
            عضو منذ {formatDate(user.createdAt)} · رقم المزايد <span className="font-mono" dir="ltr">{user.bidderNumber}</span> · {user.role === "admin" ? "مدير منصة" : "مزايد"}
          </p>
        </div>
        <Link href="/profile" className="btn btn-outline text-xs">عرض الملف الشخصي</Link>
      </div>
      <SettingsForm
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          city: user.city,
          company: user.company,
          notifyEmail: user.notifyEmail,
          notifySms: user.notifySms,
          notifyOutbid: user.notifyOutbid,
          notifyAuctions: user.notifyAuctions,
        }}
      />
      <p className="flex items-start gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-[10px] leading-5 text-ink-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-petrol-500" />
        حماية الحساب: الجلسات محفوظة في قاعدة البيانات وتنتهي بعد ٣٠ يومًا، وتُرفض العمليات الحساسة بدون جلسة صالحة.
        المزايدات والإعدادات تُتحقق من المدخلات على الخادم قبل الحفظ.
      </p>
    </div>
  );
}
