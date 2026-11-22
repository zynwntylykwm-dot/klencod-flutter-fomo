"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";

export function WatchButton({
  vehicleId,
  initial,
  variant = "icon",
}: {
  vehicleId: number;
  initial: boolean;
  variant?: "icon" | "full";
}) {
  const [watched, setWatched] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/vehicles/${vehicleId}`)}`);
        return;
      }
      const data = (await response.json()) as { watched?: boolean; error?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذّر تحديث المفضلة");
        return;
      }
      setWatched(Boolean(data.watched));
      router.refresh();
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setPending(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`btn w-full ${watched ? "btn-ink" : "btn-outline"}`}
        aria-pressed={watched}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Heart className={`size-4 ${watched ? "fill-gold-400 text-gold-400" : ""}`} />}
        {watched ? "في قائمة المفضلة" : "إضافة إلى المفضلة"}
        {error ? <span className="text-[10px] text-danger">{error}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={watched ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      aria-label={watched ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className={`flex size-8 items-center justify-center rounded-full border backdrop-blur transition ${
        watched ? "border-gold-500 bg-gold-500 text-ink-950" : "border-white/40 bg-ink-950/40 text-white hover:bg-ink-950/70"
      }`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Heart className={`size-4 ${watched ? "fill-ink-950" : ""}`} />}
    </button>
  );
}
