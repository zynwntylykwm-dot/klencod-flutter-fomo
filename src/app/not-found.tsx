import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <span className="rounded-2xl bg-cream-100 p-4 text-petrol-500"><Compass className="size-8" /></span>
      <p className="mt-4 text-xs font-extrabold tracking-widest text-gold-500">404</p>
      <h1 className="mt-1 text-2xl font-black text-ink-950">الصفحة أو اللوت غير موجود</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-ink-600">
        قد يكون اللوت قد حُذف أو تغيّر رابطه. يمكنك العودة إلى الرئيسية أو البحث في كتالوج السيارات المتاح حاليًا.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-ink"><Home className="size-4" /> الرئيسية</Link>
        <Link href="/vehicles" className="btn btn-outline"><Search className="size-4" /> تصفّح السيارات</Link>
        <Link href="/auctions/live" className="btn btn-gold">المزادات المباشرة</Link>
      </div>
    </div>
  );
}
