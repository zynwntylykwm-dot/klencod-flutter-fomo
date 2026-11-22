import { UserManager } from "@/components/admin/managers";
import { getAdminUsers } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <UserManager users={users} />;
}
