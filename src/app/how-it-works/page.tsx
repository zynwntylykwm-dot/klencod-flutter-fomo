import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CreditCard, FileCheck2, Gavel, Search, Truck, UserPlus } from "lucide-react";

import { PageHero, SectionHeading } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { getPlatformSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "كيف يعمل المزاد",
  description: "شرح خطوات التسجيل والبحث والمزايدة والدفع والاستلام، وسياسات الرسوم والحد الأدنى للزيادات.",
};

const steps = [
  { title: "التسجيل وتوثيق الحساب", body: "أنشئ حسابًا بالبريد الإلكتروني وكلمة مرور، ويُصدر لك النظام رقم مزايد فريد يُستخدم في كل عملياتك.", icon: UserPlus },
  { title: "البحث والفحص", body: "استخدم الفلاتر المتقدمة (الماركة، الطراز، السنة، السعر، الوقود، ناقل الحركة، الضرر، الموقع، VIN، رقم اللوت)، وراجع معرض الصور وتقرير الأضرار.", icon: Search },
  { title: "المزايدة", body: "كل مزايدة تُتحقق على الخادم: حالة المزاد، الوقت المتبقي، أعلى مزايدة، والحد الأدنى للزيادة. المزايدات المنخفضة أو المتكررة من نفس المتصدر تُرفض.", icon: Gavel },
  { title: "الإغلاق وتحديد الفائز", body: "عند انتهاء العدّاد يُغلق اللوت تلقائيًا ويُحدد صاحب أعلى مزايدة فائزًا (إذا استوفى السعر الاحتياطي)، وتُصدر فاتورة إلكترونية بالعمولات.", icon: BadgeCheck },
  { title: "الدفع والمستندات", body: "سدّد الفاتورة من صفحة المدفوعات. تُسجّل الدفعة في حسابك وتنعكس في لوحة الإدارة، وتُجهّز مستندات الملكية بعد السداد.", icon: CreditCard },
  { title: "الاستلام أو الشحن", body: "استلم السيارة من موقعها المرخّص أو اطلب شحنًا دوليًا (خيار قابل للتوسع في النسخة التجارية).", icon: Truck },
];

const faqs = [
  { q: "هل المزايدات حقيقية؟", a: "المزايدات في هذه النسخة تُسجّل فعليًا في قاعدة بيانات المنصة وتخضع لكل قواعد التحقق، لكن اللوتات والأسعار بيانات تجريبية لأغراض العرض، ولا تتم عمليات تسليم أو دفع حقيقية." },
  { q: "كيف يتم التحقق من صحة المزايدة؟", a: "يستخدم الخادم قفلًا على سجل اللوت أثناء المعالجة، ثم يتحقق من أن المزاد نشط، وأن الوقت الحالي قبل وقت الانتهاء، وأن المبلغ لا يقل عن أعلى مزايدة + الحد الأدنى للزيادة، وأن المزايد ليس المتصدر الحالي." },
  { q: "ماذا يحدث للمزايد الذي تم تجاوزه؟", a: "ينشئ النظام إشعارًا فوريًا له في لوحة التحكم إذا كان خيار إشعارات التجاوز مفعّلًا، مع رابط مباشر إلى اللوت لمتابعة المزايدة." },
  { q: "ما هي سياسة التمديد؟", a: "إذا وقعت مزايدة في آخر دقيقتين من المزاد، يُمدَّد وقت الانتهاء دقيقتين إضافيتين لمنح جميع المزايدين فرصة عادلة (مكافحة مزايدة اللحظة الأخيرة)." },
  { q: "كيف يُحدد الفائز عند انتهاء المزاد؟", a: "بعد انتهاء العدّاد، يغلق النظام اللوت تلقائيًا ويحدد أعلى مزايدة. يُعد اللوت مباعًا إذا استوفت المزايدة السعر الاحتياطي، وإلا يُغلق دون بيع. تُصدر فاتورة تلقائيًا للفائز تشمل العمولة ورسوم المستندات." },
  { q: "هل يمكن إتمام الدفع عبر بوابة حقيقية؟", a: "النسخة الحالية تستخدم زر دفع تجريبي لتسجيل العملية. بنية النظام مهيأة لإضافة بوابات دفع وشحن عبر واجهات الخادم (API Routes) دون تغيير الواجهة." },
];

export default async function HowItWorksPage() {
  const config = await getPlatformSettings();
  return (
    <div>
      <PageHero
        eyebrow="دليل المزايد"
        title="كيف يعمل المزاد في منارة"
        description="دليل كامل لرحلة الشراء: من إنشاء الحساب إلى استلام السيارة، مع شرح دقيق للتحقق من المزايدات وآلية تحديد الفائز."
      >
        <div className="flex flex-wrap gap-2">
          <Link href="/register" className="btn btn-gold px-4 py-2 text-xs">ابدأ الآن</Link>
          <Link href="/vehicles" className="btn border border-white/20 bg-white/5 px-4 py-2 text-xs text-white hover:bg-white/10">تصفّح السيارات</Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-9">
        <SectionHeading eyebrow="الخطوات" title="ست خطوات واضحة" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-cream-100 p-2 text-petrol-500"><step.icon className="size-4" /></span>
                <span className="text-2xl font-black text-cream-200">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-2.5 text-sm font-extrabold text-ink-950">{step.title}</h3>
              <p className="mt-1 text-[11px] leading-6 text-ink-600">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><FileCheck2 className="size-4 text-petrol-500" /> جدول الرسوم الحالي</h2>
            <dl className="mt-3 divide-y divide-line text-xs">
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">عمولة المشتري</dt><dd className="font-extrabold text-ink-950">{config.buyerFeePercent}%</dd></div>
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">الحد الأدنى لعمولة المشتري</dt><dd className="font-extrabold text-ink-950">{formatMoney(config.minBuyerFee)}</dd></div>
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">رسوم المستندات</dt><dd className="font-extrabold text-ink-950">{formatMoney(config.docFee)}</dd></div>
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">عمولة البائع (اختياري)</dt><dd className="font-extrabold text-ink-950">{config.sellerCommissionPercent}%</dd></div>
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">الحد الأدنى الافتراضي للزيادة</dt><dd className="font-extrabold text-ink-950">{formatMoney(config.defaultIncrement)}</dd></div>
              <div className="flex items-center justify-between py-2"><dt className="text-ink-600">مهلة سداد الفاتورة</dt><dd className="font-extrabold text-ink-950">{config.paymentDueDays} أيام</dd></div>
            </dl>
            <p className="mt-3 rounded-md bg-cream-100 px-2.5 py-2 text-[10px] leading-5 text-ink-600">تُدار هذه القيم من لوحة الإدارة وتُطبَّق تلقائيًا على الفواتير الجديدة.</p>
          </section>

          <section>
            <h2 className="text-sm font-extrabold text-ink-950">الأسئلة الشائعة</h2>
            <div className="mt-3 space-y-2">
              {faqs.map((faq) => (
                <details key={faq.q} className="card group p-3.5">
                  <summary className="cursor-pointer text-xs font-extrabold text-ink-900">{faq.q}</summary>
                  <p className="mt-2 text-[11px] leading-6 text-ink-700">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-line bg-white p-5">
          <h2 className="text-sm font-extrabold text-ink-950">حسابات تجريبية للاختبار</h2>
          <p className="mt-1 text-[11px] text-ink-600">يمكنك تسجيل حساب جديد أو استخدام الحسابات الجاهزة لاختبار المزايدة ولوحة الإدارة.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-cream-100 px-3 py-2 text-[11px]">
              <p className="font-extrabold text-ink-950">حساب مزايد</p>
              <p dir="ltr" className="font-mono text-ink-700">bidder@manara.example / Bidder@12345</p>
            </div>
            <div className="rounded-lg bg-cream-100 px-3 py-2 text-[11px]">
              <p className="font-extrabold text-ink-950">حساب إدارة</p>
              <p dir="ltr" className="font-mono text-ink-700">admin@manara.example / Admin@12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
