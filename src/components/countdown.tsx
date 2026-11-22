"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  end: string | null;
  start?: string | null;
  status: string;
  compact?: boolean;
  tone?: "light" | "dark";
};

function segments(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

const two = (value: number) => String(value).padStart(2, "0");

export function Countdown({ end, start, status, compact = false, tone = "dark" }: Props) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end, start]);

  const base = tone === "dark" ? "text-white" : "text-ink-900";
  const muted = tone === "dark" ? "text-white/60" : "text-ink-600";

  if (!end) return null;
  const endTime = new Date(end).getTime();
  const startTime = start ? new Date(start).getTime() : null;

  if (status === "sold" || status === "ended") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${muted}`}>
        <Clock className="size-3.5" /> المزاد مغلق
      </span>
    );
  }

  if (now === null) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${muted}`} dir="ltr">
        <Clock className="size-3.5" /> --:--:--
      </span>
    );
  }

  const isUpcoming = status === "upcoming" && startTime !== null && now < startTime;
  const target = isUpcoming ? startTime! : endTime;
  const diff = target - now;

  if (diff <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${tone === "dark" ? "text-gold-300" : "text-danger"}`}>
        <Clock className="size-3.5" /> جارٍ إغلاق المزاد...
      </span>
    );
  }

  const { days, hours, minutes, seconds } = segments(diff);
  const urgent = !isUpcoming && diff < 60 * 60 * 1000;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold tabular-nums ${urgent ? "text-danger" : base}`}
        dir="ltr"
      >
        <Clock className="size-3.5" />
        {days > 0 ? `${days}d ` : ""}
        {two(hours)}:{two(minutes)}:{two(seconds)}
      </span>
    );
  }

  const label = isUpcoming ? "يبدأ المزاد خلال" : urgent ? "ينتهي قريبًا جدًا" : "ينتهي المزاد خلال";
  const boxes = [
    { value: days, unit: "يوم" },
    { value: hours, unit: "ساعة" },
    { value: minutes, unit: "دقيقة" },
    { value: seconds, unit: "ثانية" },
  ];

  return (
    <div>
      <p className={`mb-1.5 text-[11px] font-bold ${tone === "dark" ? "text-gold-300" : "text-danger"}`}>{label}</p>
      <div className="flex items-center gap-1.5" dir="ltr">
        {boxes.map((box) => (
          <div
            key={box.unit}
            className={`flex min-w-11 flex-col items-center rounded-md px-1.5 py-1 ${
              tone === "dark" ? "bg-white/10 text-white" : "bg-ink-950 text-white"
            }`}
          >
            <span className="text-sm font-extrabold tabular-nums leading-none">{two(box.value)}</span>
            <span className="mt-0.5 text-[9px] opacity-70">{box.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
