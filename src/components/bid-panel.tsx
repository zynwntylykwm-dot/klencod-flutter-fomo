"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Gavel, Loader2, Lock, Minus, Plus, RefreshCw, TrendingUp, Users } from "lucide-react";

import { Countdown } from "@/components/countdown";
import { Badge } from "@/components/ui";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

type Snapshot = {
  currentBid: number;
  bidCount: number;
  minIncrement: number;
  status: string;
  auctionEnd: string;
  auctionStart: string;
  winningBid: number | null;
  winnerId: number | null;
};

type Props = {
  vehicleId: number;
  initial: Snapshot;
  authenticated: boolean;
  leaderId: number | null;
  currentUserId: number | null;
  watched: boolean;
  buyerFeePercent: number;
  minBuyerFee: number;
  docFee: number;
};

export function BidPanel({
  vehicleId,
  initial,
  authenticated,
  leaderId,
  currentUserId,
  watched,
  buyerFeePercent,
  minBuyerFee,
  docFee,
}: Props) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>(initial);
  const [amount, setAmount] = useState<number>(initial.currentBid + initial.minIncrement);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const isLive = snapshot.status === "live";
  const minimum = Math.max(snapshot.currentBid + snapshot.minIncrement, initial.currentBid + snapshot.minIncrement);
  const isLeading = authenticated && leaderId !== null && leaderId === currentUserId;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bids`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Snapshot;
      setSnapshot((current) => ({ ...current, ...data }));
      setUpdatedAt(new Date().toLocaleTimeString("en-GB"));
    } catch {
      /* silent: polling will retry */
    } finally {
      setRefreshing(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    setAmount((current) => (current < minimum ? minimum : current));
  }, [minimum]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!authenticated) {
      router.push(`/login?next=${encodeURIComponent(`/vehicles/${vehicleId}`)}`);
      return;
    }
    if (!Number.isFinite(amount) || amount < minimum) {
      setError(`الحد الأدنى للمزايدة هو ${formatMoney(minimum)}`);
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = (await response.json()) as Snapshot & { error?: string; extended?: boolean; message?: string };
      if (!response.ok) {
        setError(data.error ?? "تعذّر تسجيل المزايدة");
        await refresh();
        return;
      }
      setSnapshot((current) => ({ ...current, ...data }));
      setSuccess(data.extended ? "تم تسجيل مزايدتك وتم تمديد المزاد دقيقتين (مكافحة المزايدة اللحظية)." : "تم تسجيل مزايدتك بنجاح، أنت الأعلى مزايدة الآن.");
      setAmount(data.currentBid + data.minIncrement);
      await refresh();
      router.refresh();
    } catch {
      setError("خطأ في الاتصال، تحقق من الشبكة وحاول مرة أخرى");
    } finally {
      setPending(false);
    }
  };

  const fee = Math.max(minBuyerFee, Math.round((amount * buyerFeePercent) / 100));

  if (!isLive) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-ink-950 px-4 py-3 text-white">
          <p className="text-xs font-semibold text-cream-200/70">حالة اللوت</p>
          <p className="text-lg font-extrabold">
            {snapshot.status === "upcoming" ? "مزايدة مسبقة غير متاحة" : snapshot.status === "sold" ? "تمت عملية البيع" : "المزاد مغلق"}
          </p>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-lg border border-line bg-cream-50 p-3">
            <p className="text-xs font-bold text-ink-600">
              {snapshot.status === "upcoming" ? "يبدأ المزاد في" : "انتهى المزاد في"}
            </p>
            <p className="mt-1 text-sm font-extrabold text-ink-950">
              {formatDateTime(snapshot.status === "upcoming" ? snapshot.auctionStart : snapshot.auctionEnd)}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2 text-sm">
            <span className="text-ink-600">{snapshot.status === "sold" ? "سعر البيع" : "أعلى مزايدة"}</span>
            <span className="font-extrabold text-ink-950">{formatMoney(snapshot.winningBid ?? snapshot.currentBid)}</span>
          </div>
          <p className="flex items-start gap-2 rounded-lg bg-petrol-500/10 px-3 py-2 text-xs leading-6 text-petrol-500">
            <Lock className="mt-0.5 size-4 shrink-0" />
            لا يمكن تسجيل مزايدات جديدة على لوت غير نشط. تابع المزادات القادمة أو تصفّح اللوتات المباشرة.
          </p>
          <div className="grid gap-2">
            <Link href="/auctions/live" className="btn btn-ink w-full">المزادات المباشرة</Link>
            <Link href="/vehicles" className="btn btn-outline w-full">لوتات مشابهة</Link>
          </div>
          {watched ? <Badge tone="gold">اللوت في قائمة المفضلة</Badge> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="hero-mesh px-4 py-3.5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-cream-200/70">أعلى مزايدة حالية</p>
            <p className="text-3xl font-extrabold tracking-tight">{formatMoney(snapshot.currentBid)}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/20 px-2 py-1 text-[10px] font-extrabold text-[#7ae0b1]">
            <span className="live-dot size-1.5 rounded-full bg-[#7ae0b1]" /> مباشر
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-2.5">
          <Countdown end={snapshot.auctionEnd} start={snapshot.auctionStart} status={snapshot.status} tone="dark" />
          <div className="text-end">
            <p className="flex items-center justify-end gap-1 text-xs font-bold text-cream-200/80">
              <Users className="size-3.5" /> {formatNumber(snapshot.bidCount)} مزايدة
            </p>
            <p className="text-[10px] text-cream-200/60">الأقل زيادة: {formatMoney(snapshot.minIncrement)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {isLeading ? (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-[#12603f]">
            <CheckCircle2 className="size-4" /> أنت الأعلى مزايدة حاليًا على هذا اللوت
          </div>
        ) : leaderId ? (
          <div className="flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-3 py-2 text-xs font-bold text-[#7a5a12]">
            <TrendingUp className="size-4" /> مزايد آخر يقود المزاد حاليًا — تجاوزه لإحكام الفوز
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 5].map((multiplier) => {
            const value = minimum + snapshot.minIncrement * (multiplier - 1);
            return (
              <button
                key={multiplier}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                  amount === value ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white text-ink-800 hover:border-ink-700"
                }`}
              >
                {formatMoney(value)}
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-2">
          <label className="block">
            <span className="field-label">مزاجتك المقترحة (بالدولار)</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAmount((value) => Math.max(minimum, value - snapshot.minIncrement))}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-800 hover:border-ink-700"
                aria-label="تقليل"
              >
                <Minus className="size-4" />
              </button>
              <input
                type="number"
                min={minimum}
                step={snapshot.minIncrement}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="field text-center text-lg font-extrabold"
                dir="ltr"
                aria-label="قيمة المزايدة"
              />
              <button
                type="button"
                onClick={() => setAmount((value) => value + snapshot.minIncrement)}
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink-800 hover:border-ink-700"
                aria-label="زيادة"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <span className="mt-1 block text-[10px] text-ink-600">الحد الأدنى المقبول: {formatMoney(minimum)}</span>
          </label>

          {error ? (
            <p className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-bold text-danger">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> {error}
            </p>
          ) : null}
          {success ? (
            <p className="flex items-start gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-bold text-[#12603f]">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" /> {success}
            </p>
          ) : null}

          {authenticated ? (
            <button type="submit" disabled={pending} className="btn btn-gold w-full py-3 text-base">
              {pending ? <Loader2 className="size-5 animate-spin" /> : <Gavel className="size-5" />}
              {pending ? "جارٍ تسجيل المزايدة..." : "تسجيل المزايدة"}
            </button>
          ) : (
            <div className="space-y-2">
              <Link href={`/login?next=/vehicles/${vehicleId}`} className="btn btn-gold w-full py-3 text-base">
                <Gavel className="size-5" /> سجّل الدخول للمزايدة
              </Link>
              <Link href="/register" className="btn btn-outline w-full">إنشاء حساب مزايد جديد</Link>
            </div>
          )}
          <p className="text-center text-[10px] leading-5 text-ink-600">
            ستُضاف عمولة المشتري {buyerFeePercent}% (بحد أدنى {formatMoney(minBuyerFee)}) ورسوم مستندات {formatMoney(docFee)}.
            <br />
            تقدير الإجمالي: <span className="font-bold text-ink-950">{formatMoney(amount + fee + docFee)}</span>
          </p>
        </form>

        <div className="flex items-center justify-between border-t border-line pt-2 text-[10px] text-ink-600">
          <span>تحديث تلقائي كل ٥ ثوانٍ {updatedAt ? `· ${updatedAt}` : ""}</span>
          <button type="button" onClick={refresh} className="flex items-center gap-1 font-bold hover:text-ink-950">
            <RefreshCw className={`size-3 ${refreshing ? "animate-spin" : ""}`} /> تحديث
          </button>
        </div>
      </div>
    </div>
  );
}
