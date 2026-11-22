import { Bell } from "lucide-react";

import { NotificationComposer } from "@/components/admin/managers";
import { Badge } from "@/components/ui";
import { getAdminNotifications, getAdminUsers } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const [notifications, users] = await Promise.all([getAdminNotifications(), getAdminUsers()]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <NotificationComposer users={users.map((user) => ({ id: user.id, name: `${user.name} (${user.email})` }))} />
        <div className="card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Bell className="size-4 text-petrol-500" /> آخر الإشعارات المرسلة</h2>
          <ul className="mt-2 divide-y divide-line">
            {notifications.map((notification) => (
              <li key={notification.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold text-ink-950">{notification.title}</p>
                  <Badge tone={notification.userId ? "neutral" : "gold"}>{notification.userId ? "خاص" : "عام"}</Badge>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-5 text-ink-600">{notification.body}</p>
                <p className="mt-0.5 text-[9px] text-ink-600">
                  {notification.userName ?? "جميع المستخدمين"} · {formatDateTime(notification.createdAt)} · {notification.readAt ? "مقروء" : "غير مقروء"}
                </p>
              </li>
            ))}
            {notifications.length === 0 ? <li className="py-6 text-center text-[11px] text-ink-600">لا إشعارات.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
