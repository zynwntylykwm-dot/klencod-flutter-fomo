import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="#0A1A2B" />
      <path d="M24 6.5 28.4 14h-8.8L24 6.5Z" fill="#E5BB63" />
      <path d="M19.6 15.5h8.8l1.1 4.2h-11l1.1-4.2Z" fill="#F0D394" />
      <path d="M17.3 21.2h13.4l4 18.3H13.3l4-18.3Z" fill="#F7F5F0" />
      <path d="M15.6 28.6h16.8l.8 3.6H14.8l.8-3.6Z" fill="#D8A63F" />
      <path d="M13.9 36.2h20.2l.4 1.8a1.6 1.6 0 0 1-1.6 1.9H15.1a1.6 1.6 0 0 1-1.6-1.9l.4-1.8Z" fill="#2A7D83" />
      <path d="M9.5 23.5 16 25.5M38.5 23.5 32 25.5" stroke="#E5BB63" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

export function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={BRAND.fullAr}>
      <LogoMark />
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-tight ${variant === "light" ? "text-ink-950" : "text-white"}`}>
          {BRAND.nameAr}
          <span className="mx-1 text-gold-500">|</span>
          <span className="font-semibold">{BRAND.nameEn}</span>
        </span>
        <span className={`block text-[10px] font-semibold tracking-[0.18em] ${variant === "light" ? "text-ink-600" : "text-cream-200"}`}>
          AUTO AUCTIONS
        </span>
      </span>
    </Link>
  );
}
