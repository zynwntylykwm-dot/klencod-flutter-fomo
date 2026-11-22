import { VehicleManager } from "@/components/admin/vehicle-manager";
import { getAdminAuctions, getAdminVehicles } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const [vehicles, auctions] = await Promise.all([getAdminVehicles(), getAdminAuctions()]);
  return (
    <VehicleManager
      vehicles={vehicles}
      auctions={auctions.map((auction) => ({ id: auction.id, name: auction.name, code: auction.code }))}
    />
  );
}
