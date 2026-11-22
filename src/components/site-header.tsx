import { getCurrentUser } from "@/lib/auth";
import { getUnreadNotificationCount, getWatchlistIds } from "@/lib/queries";
import { HeaderShell } from "@/components/header-shell";

export async function SiteHeader() {
  const user = await getCurrentUser();
  let watchCount = 0;
  let unread = 0;
  if (user) {
    try {
      const [ids, unreadCount] = await Promise.all([
        getWatchlistIds(user.id),
        getUnreadNotificationCount(user.id),
      ]);
      watchCount = ids.length;
      unread = unreadCount;
    } catch {
      watchCount = 0;
    }
  }
  return (
    <HeaderShell
      user={user ? { name: user.name, email: user.email, role: user.role, bidderNumber: user.bidderNumber } : null}
      watchCount={watchCount}
      unread={unread}
    />
  );
}
