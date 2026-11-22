import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";

const tones: Record<string, string> = {
  live: "bg-success/10 text-success border-success/30",
  upcoming: "bg-petrol-500/10 text-petrol-500 border-petrol-500/30",
  sold: "bg-ink-900/10 text-ink-800 border-ink-900/20",
  ended: "bg-ink-900/5 text-ink-600 border-line",
  gold: "bg-gold-500/15 text-[#8a6413] border-gold-500/40",
  danger: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-cream-100 text-ink-700 border-line",
  success: "bg-success/10 text-success border-success/30",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof tones | string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
        tones[tone] ?? tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

const vehicleStatusMap: Record<string, { label: string; tone: string; dot: boolean }> = {
  live: { label: "مباشر الآن", tone: "live", dot: true },
  upcoming: { label: "قادم", tone: "upcoming", dot: false },
  sold: { label: "مباع", tone: "sold", dot: false },
  ended: { label: "منتهي", tone: "ended", dot: false },
};

export function StatusPill({ status }: { status: string }) {
  const info = vehicleStatusMap[status] ?? vehicleStatusMap.upcoming;
  return (
    <Badge tone={info.tone}>
      {info.dot ? <span className="live-dot inline-block size-1.5 rounded-full bg-success" /> : null}
      {info.label}
    </Badge>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:flex-col md:items-center" : ""
      }`}
    >
      <div>
        {eyebrow ? (
          <p className="mb-1.5 flex items-center gap-2 text-xs font-extrabold tracking-wide text-petrol-500">
            <span className="inline-block h-px w-6 bg-gold-500" />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-extrabold text-ink-950 md:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-ink-600">{label}</p>
        {icon ? <span className="rounded-md bg-cream-100 p-1.5 text-petrol-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink-950">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-ink-600">{hint}</p> : null}
    </div>
  );
}

export function Alert({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "neutral" | "success" | "danger" | "gold";
  title?: string;
  children?: ReactNode;
}) {
  const map = {
    neutral: "border-line bg-cream-100 text-ink-700",
    success: "border-success/30 bg-success/10 text-[#12603f]",
    danger: "border-danger/30 bg-danger/10 text-[#8f2f22]",
    gold: "border-gold-500/40 bg-gold-500/10 text-[#7a5a12]",
  };
  return (
    <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${map[tone]}`}>
      {title ? <p className="font-bold">{title}</p> : null}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 rounded-full bg-cream-100 p-3 text-ink-600">
        <Inbox className="size-6" />
      </span>
      <h3 className="text-base font-extrabold text-ink-950">{title}</h3>
      {description ? <p className="mt-1.5 max-w-md text-sm text-ink-600">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="hero-mesh border-b border-ink-800">
      <div className="mx-auto max-w-7xl px-4 py-9">
        {eyebrow ? <p className="text-xs font-extrabold tracking-wide text-gold-400">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-3xl font-extrabold text-white md:text-4xl">{title}</h1>
        {description ? <p className="mt-2.5 max-w-3xl text-sm leading-7 text-cream-200/80">{description}</p> : null}
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </section>
  );
}

export function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | number | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "" || key === "page") continue;
      query.set(key, String(value));
    }
    query.set("page", String(target));
    return `${basePath}?${query.toString()}`;
  };
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter(
    (value) => value === 1 || value === pages || Math.abs(value - page) <= 1,
  );
  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="تنقل الصفحات">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`btn btn-outline px-3 py-2 ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        <ChevronRight className="size-4" /> السابق
      </Link>
      {numbers.map((value, index) => (
        <span key={value} className="flex items-center gap-2">
          {index > 0 && value - numbers[index - 1] > 1 ? <span className="text-ink-600">…</span> : null}
          <Link
            href={href(value)}
            className={`flex size-9 items-center justify-center rounded-md border text-sm font-bold ${
              page === value ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white text-ink-700 hover:border-ink-700"
            }`}
          >
            {value}
          </Link>
        </span>
      ))}
      <Link
        href={href(Math.min(pages, page + 1))}
        aria-disabled={page === pages}
        className={`btn btn-outline px-3 py-2 ${page === pages ? "pointer-events-none opacity-40" : ""}`}
      >
        التالي <ChevronLeft className="size-4" />
      </Link>
    </nav>
  );
}
