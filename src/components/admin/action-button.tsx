"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export function FinalizeButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage("");
          const response = await fetch("/api/admin/finalize", { method: "POST" });
          const data = (await response.json()) as { error?: string };
          setMessage(response.ok ? "تم إغلاق المزادات المستحقة وتحديث الفواتير" : data.error ?? "تعذّر التنفيذ");
          router.refresh();
          setPending(false);
        }}
        className="btn btn-outline text-xs"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
        إغلاق المزادات المنتهية الآن
      </button>
      {message ? <span className="flex items-center gap-1 text-[11px] font-bold text-success"><CheckCircle2 className="size-3.5" /> {message}</span> : null}
    </div>
  );
}
