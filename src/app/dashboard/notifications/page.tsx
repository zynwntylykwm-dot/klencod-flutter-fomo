import type { Metadata } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";

import { NotificationsReadButton } from "@/components/notifications-read-button";
import { Badge, EmptyState } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getUserNotifications } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الإشعارات" };

const typeLabels: Record<string, { label: string; tone: string }> = {
  info: { label: "عام", tone: "neutral" },
  bid: { label: "مزايدة", tone: "upcoming" },
  win: { label: "فوز", tone: "gold" },
  payment: { label: "دفع", tone: "success" },
  auction: { label: "مزاد", tone: "live" },
};

export default async function NotificationsPage() {
  const user = await requireUser("/dashboard/notifications");
  const notifications = await getUserNotifications(user.id, 60);
  const unread = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <h1 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Bell className="size-4 text-petrol-500" /> جميع الإشعارات</h1>
          <p className="text-[11px] text-ink-600">{unread} إشعار غير مقروء · تُحدَّث عند كل مزايدة أو فوز أو سداد</p>
        </div>
        <NotificationsReadButton />
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="لا إشعارات" description="ستظهر هنا إشعارات المزايدات والفوز والفواتير وقائمة المفضلة." />
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const meta = typeLabels[notification.type] ?? typeLabels.info;
            return (
              <li key={notification.id} className={`card p-3.5 ${notification.readAt ? "" : "border-petrol-400/60 bg-petrol-500/[0.04]"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-extrabold text-ink-950">
                    {!notification.readAt ? <span className="size-1.5 rounded-full bg-danger" /> : null}
                    {notification.title}
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </p>
                  <span className="text-[10px] text-ink-600">{formatDateTime(notification.createdAt)}</span>
                </div>
                <p className="mt-1 text-[11px] leading-6 text-ink-700">{notification.body}</p>
                {notification.link ? (
                  <Link href={notification.link} className="mt-1 inline-block text-[10px] font-bold text-petrol-500 hover:underline">عرض التفاصيل ←</Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
