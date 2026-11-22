import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.fullAr} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.fullAr}`,
  },
  description:
    "منارة للمزادات منصة متكاملة لمزادات السيارات: تصفح آلاف اللوتات، فلترة متقدمة، مزايدة فورية، ومتابعة كاملة للمدفوعات والفواتير.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream-50 text-ink-900 antialiased">
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
