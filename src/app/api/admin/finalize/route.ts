import { settleAuctions } from "@/lib/auctions";
import { guardAdmin } from "@/lib/http";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  const guard = await guardAdmin();
  if ("response" in guard) return guard.response;
  await settleAuctions(true);
  return ok({ settled: true, at: new Date().toISOString() });
}
