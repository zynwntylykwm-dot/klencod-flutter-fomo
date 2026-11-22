"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string; badge?: number };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
              active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-cream-100"
            }`}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-gold-500 text-ink-950" : "bg-cream-200 text-ink-800"}`}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
