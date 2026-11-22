"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";

export function NotificationsReadButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/notifications/read", { method: "POST" });
        router.refresh();
        setPending(false);
      }}
      className="flex items-center gap-1 text-[11px] font-bold text-petrol-500 hover:text-ink-950"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />} تحديد الكل كمقروء
    </button>
  );
}
