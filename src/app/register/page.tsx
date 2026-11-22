import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CreditCard, FileCheck2, Gavel } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { LogoMark } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إنشاء حساب" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(next || "/dashboard");

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_1fr] lg:py-14">
      <div className="card order-2 p-5 sm:p-7 lg:order-1">
        <div className="mb-4 lg:hidden">
          <LogoMark size={44} />
        </div>
        <h1 className="text-xl font-extrabold text-ink-950">إنشاء حساب مزايد</h1>
        <p className="mt-1 text-xs leading-6 text-ink-600">
          التسجيل مجاني ويتيح لك المزايدة على كل اللوتات، حفظ المفضلة، ومتابعة الفواتير والإشعارات.
        </p>
        <div className="mt-4">
          <AuthForm mode="register" next={next} />
        </div>
      </div>

      <div className="hero-mesh order-1 rounded-2xl p-7 text-white lg:order-2">
        <div className="flex items-center gap-2.5">
          <LogoMark size={40} />
          <div>
            <p className="text-base font-extrabold">منارة | MANARA</p>
            <p className="text-[10px] tracking-widest text-gold-300">AUTO AUCTIONS</p>
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-extrabold leading-snug">انضم إلى ساحة مزادات شفافة</h2>
        <p className="mt-2 text-sm leading-7 text-cream-200/80">
          سيارات أساطيل وشركات تأمين وتأجير بأسعار تنافسية، مع تقرير أضرار وتقدير إصلاح وصور متعددة لكل لوت.
        </p>
        <div className="mt-6 grid gap-2">
          {[
            { title: "رقم مزايد خاص", body: "يُصدر تلقائيًا ويُستخدم في سجل المزايدات والفواتير.", icon: BadgeCheck },
            { title: "مزايدة موثقة", body: "كل مزايدة تُحفظ في قاعدة البيانات مع الوقت والمبلغ.", icon: Gavel },
            { title: "فواتير واضحة", body: "عمولة المشتري ورسوم المستندات محسوبة مسبقًا.", icon: FileCheck2 },
            { title: "دفع تجريبي آمن", body: "سجّل السداد لمحاكاة دورة الشراء الكاملة.", icon: CreditCard },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/5 p-2.5">
              <item.icon className="mt-0.5 size-4 text-gold-400" />
              <div>
                <p className="text-xs font-extrabold">{item.title}</p>
                <p className="text-[10px] leading-5 text-cream-200/70">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[10px] text-cream-200/60">
          لديك حساب؟ <Link href="/login" className="font-bold text-gold-300 hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
