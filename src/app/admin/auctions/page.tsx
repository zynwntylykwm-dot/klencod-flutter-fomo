import { AuctionManager } from "@/components/admin/managers";
import { getAdminAuctions } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminAuctionsPage() {
  const auctions = await getAdminAuctions();
  return <AuctionManager auctions={auctions} />;
}
