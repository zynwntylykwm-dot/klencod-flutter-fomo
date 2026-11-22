"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export function PayButton({ invoiceId, total, disabled }: { invoiceId: number; total: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (disabled) {
    return <span className="rounded-md bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">مدفوعة</span>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          const response = await fetch(`/api/invoices/${invoiceId}/pay`, { method: "POST" });
          const data = (await response.json()) as { error?: string };
          if (!response.ok) {
            setError(data.error ?? "تعذّر إتمام الدفع");
          } else {
            router.refresh();
          }
          setPending(false);
        }}
        className="btn btn-gold px-3 py-1.5 text-[11px]"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CreditCard className="size-3.5" />}
        دفع {total}
      </button>
      {error ? <p className="mt-1 text-[10px] text-danger">{error}</p> : null}
    </div>
  );
}
