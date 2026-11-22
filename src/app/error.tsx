"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center">
      <span className="rounded-2xl bg-danger/10 p-4 text-danger"><AlertTriangle className="size-8" /></span>
      <h1 className="mt-4 text-2xl font-black text-ink-950">حدث خطأ غير متوقع</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-ink-600">
        تعذّر تحميل هذه الصفحة. قد تكون المشكلة مؤقتة في الاتصال بالخادم أو قاعدة البيانات. يمكنك إعادة المحاولة أو العودة للرئيسية.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn btn-ink"><RotateCcw className="size-4" /> إعادة المحاولة</button>
        <Link href="/" className="btn btn-outline">الرئيسية</Link>
      </div>
    </div>
  );
}
