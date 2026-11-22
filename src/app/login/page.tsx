import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Gauge, Heart, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { LogoMark } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تسجيل الدخول" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  const user = await getCurrentUser();
  if (user) redirect(next || "/dashboard");

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_1fr] lg:py-14">
      <div className="hidden rounded-2xl hero-mesh p-7 text-white lg:block">
        <div className="flex items-center gap-2.5">
          <LogoMark size={40} />
          <div>
            <p className="text-base font-extrabold">منارة | MANARA</p>
            <p className="text-[10px] tracking-widest text-gold-300">AUTO AUCTIONS</p>
          </div>
        </div>
        <h1 className="mt-8 text-2xl font-extrabold leading-snug">مرحبًا بعودتك إلى ساحة المزاد</h1>
        <p className="mt-2 text-sm leading-7 text-cream-200/80">
          سجّل دخولك لمتابعة مزايداتك، وإدارة مفضلتك، وسداد فواتيرك، وتلقي إشعارات تجاوز المزايدة لحظة حدوثها.
        </p>
        <ul className="mt-6 space-y-2.5 text-xs text-cream-200/85">
          {[
            { text: "مزايدات مسجّلة على الخادم مع سجل كامل", icon: ShieldCheck },
            { text: "تحديث تلقائي للأسعار والعدّاد التنازلي", icon: Gauge },
            { text: "إشعارات فورية عند تجاوز مزايدتك", icon: BadgeCheck },
            { text: "قائمة مفضلة ومتابعة كل اللوتات", icon: Heart },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-2">
              <item.icon className="size-4 text-gold-400" /> {item.text}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-lg border border-white/15 bg-white/5 p-3 text-[11px]">
          <p className="font-extrabold text-gold-300">حسابات العرض التجريبية</p>
          <p className="mt-1 font-mono" dir="ltr">bidder@manara.example / Bidder@12345</p>
          <p className="font-mono" dir="ltr">admin@manara.example / Admin@12345</p>
        </div>
      </div>

      <div className="card p-5 sm:p-7">
        <div className="mb-4 lg:hidden">
          <LogoMark size={44} />
        </div>
        <h2 className="text-xl font-extrabold text-ink-950">تسجيل الدخول</h2>
        <p className="mt-1 text-xs text-ink-600">أدخل بيانات حسابك للوصول إلى لوحة التحكم والمزايدة.</p>
        <div className="mt-4">
          <AuthForm mode="login" next={next} />
        </div>
        <div className="mt-4 rounded-lg bg-cream-100 p-3 text-[11px] text-ink-700 lg:hidden">
          <p className="font-extrabold text-ink-950">حساب تجريبي للمزايد</p>
          <p dir="ltr" className="font-mono">bidder@manara.example / Bidder@12345</p>
          <p className="mt-1 font-extrabold text-ink-950">حساب الإدارة</p>
          <p dir="ltr" className="font-mono">admin@manara.example / Admin@12345</p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px] text-ink-600">
          <Link href="/vehicles" className="hover:text-petrol-500">تصفّح السيارات دون تسجيل</Link>
          <Link href="/how-it-works" className="font-bold hover:text-petrol-500">كيف يعمل المزاد؟</Link>
        </div>
      </div>
    </div>
  );
}
