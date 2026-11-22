"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Bell, CheckCircle2, Loader2, Plus, Save, Settings2, ShieldCheck, X } from "lucide-react";

import type { AdminAuctionRow, AdminInvoiceRow, AdminUserRow } from "@/lib/admin-queries";
import { AUCTION_STATUS_LABELS, INVOICE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

type Feedback = { tone: "success" | "danger"; message: string } | null;

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${feedback.tone === "success" ? "bg-success/10 text-[#12603f]" : "bg-danger/10 text-danger"}`}>
      {feedback.tone === "success" ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />} {feedback.message}
    </p>
  );
}

export function AuctionManager({ auctions }: { auctions: AdminAuctionRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const now = new Date();
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    country: "الولايات المتحدة",
    startsAt: now.toISOString().slice(0, 16),
    endsAt: new Date(now.getTime() + 86400000).toISOString().slice(0, 16),
    status: "upcoming",
    description: "",
  });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const payload = { ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString() };
    const response = await fetch(editingId ? `/api/admin/auctions/${editingId}` : "/api/admin/auctions", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setFeedback(response.ok ? { tone: "success", message: editingId ? "تم تحديث المزاد" : "تم إنشاء المزاد" } : { tone: "danger", message: data.error ?? "تعذّر الحفظ" });
    if (response.ok) {
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    }
    setPending(false);
  };

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3">
        <div>
          <h1 className="text-sm font-extrabold text-ink-950">إدارة المزادات ({auctions.length})</h1>
          <p className="text-[10px] text-ink-600">تحديد مواعيد البداية والنهاية، الحالة، والموقع لكل قاعة مزاد.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm({
              name: "",
              code: "",
              location: "",
              country: "الولايات المتحدة",
              startsAt: new Date().toISOString().slice(0, 16),
              endsAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
              status: "upcoming",
              description: "",
            });
            setShowForm(true);
          }}
          className="btn btn-gold text-xs"
        >
          <Plus className="size-3.5" /> مزاد جديد
        </button>
      </div>
      <FeedbackBanner feedback={feedback} />

      {showForm ? (
        <form onSubmit={submit} className="card space-y-2.5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink-950">{editingId ? "تعديل المزاد" : "مزاد جديد"}</h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="إغلاق"><X className="size-4 text-ink-600" /></button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <label><span className="field-label">اسم المزاد *</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field" /></label>
            <label><span className="field-label">الرمز *</span><input required dir="ltr" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="field" placeholder="DAL-120" /></label>
            <label><span className="field-label">الحالة</span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="field">
                <option value="upcoming">قادم</option>
                <option value="live">مباشر</option>
                <option value="ended">منتهي</option>
              </select>
            </label>
            <label><span className="field-label">الموقع *</span><input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="field" /></label>
            <label><span className="field-label">البلد</span><input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} className="field" /></label>
            <label><span className="field-label">بداية المزاد (UTC)</span><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="field" /></label>
            <label><span className="field-label">نهاية المزاد (UTC)</span><input required type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className="field" /></label>
          </div>
          <label className="block"><span className="field-label">الوصف</span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="field" /></label>
          <button type="submit" disabled={pending} className="btn btn-ink">{pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} حفظ المزاد</button>
        </form>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {auctions.map((auction) => (
          <article key={auction.id} className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] font-extrabold text-petrol-500" dir="ltr">{auction.code}</p>
                <h3 className="text-sm font-extrabold text-ink-950">{auction.name}</h3>
                <p className="text-[10px] text-ink-600">{auction.location} · {auction.country}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${auction.status === "live" ? "bg-success/10 text-success" : auction.status === "upcoming" ? "bg-petrol-500/10 text-petrol-500" : "bg-cream-200 text-ink-700"}`}>
                {AUCTION_STATUS_LABELS[auction.status] ?? auction.status}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] text-ink-600">
              <p>البداية: {formatDateTime(auction.startsAt)}</p>
              <p>النهاية: {formatDateTime(auction.endsAt)}</p>
              <p>اللوتات: <span className="font-bold text-ink-950">{formatNumber(auction.lotCount)}</span></p>
            </div>
            <div className="mt-3 flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditingId(auction.id);
                  setForm({
                    name: auction.name,
                    code: auction.code,
                    location: auction.location,
                    country: auction.country,
                    startsAt: new Date(auction.startsAt).toISOString().slice(0, 16),
                    endsAt: new Date(auction.endsAt).toISOString().slice(0, 16),
                    status: auction.status,
                    description: auction.description ?? "",
                  });
                  setShowForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="btn btn-outline flex-1 text-[11px]"
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`حذف المزاد ${auction.name}؟ ستبقى اللوتات دون مزاد.`)) return;
                  const response = await fetch(`/api/admin/auctions/${auction.id}`, { method: "DELETE" });
                  setFeedback(response.ok ? { tone: "success", message: "تم حذف المزاد" } : { tone: "danger", message: "تعذّر الحذف" });
                  router.refresh();
                }}
                className="btn btn-outline text-[11px] text-danger"
              >
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function UserManager({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const patch = async (id: number, payload: Record<string, string>) => {
    setPendingId(id);
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setFeedback(response.ok ? { tone: "success", message: "تم تحديث بيانات المستخدم" } : { tone: "danger", message: data.error ?? "تعذّر التحديث" });
    router.refresh();
    setPendingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <h1 className="text-sm font-extrabold text-ink-950">إدارة الحسابات والصلاحيات ({users.length})</h1>
        <p className="text-[10px] text-ink-600">ترقية مستخدم إلى مدير أو إيقاف الحساب. لا يمكن تعديل حسابك الحالي.</p>
      </div>
      <FeedbackBanner feedback={feedback} />
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-cream-50 text-[10px] text-ink-600">
            <tr>
              <th className="px-3 py-2 text-start font-bold">المستخدم</th>
              <th className="px-3 py-2 text-start font-bold">رقم المزايد</th>
              <th className="px-3 py-2 text-start font-bold">المزايدات</th>
              <th className="px-3 py-2 text-start font-bold">مرات الفوز</th>
              <th className="px-3 py-2 text-start font-bold">الصلاحية</th>
              <th className="px-3 py-2 text-start font-bold">الحالة</th>
              <th className="px-3 py-2 text-start font-bold">التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-cream-50">
                <td className="px-3 py-2">
                  <p className="font-bold text-ink-950">{user.name}</p>
                  <p className="text-[10px] text-ink-600" dir="ltr">{user.email}</p>
                </td>
                <td className="px-3 py-2 font-mono text-[10px]" dir="ltr">{user.bidderNumber}</td>
                <td className="px-3 py-2 text-ink-700">{formatNumber(user.bidCount)}</td>
                <td className="px-3 py-2 text-ink-700">{formatNumber(user.winCount)}</td>
                <td className="px-3 py-2">
                  <select
                    value={user.role}
                    disabled={pendingId === user.id}
                    onChange={(event) => patch(user.id, { role: event.target.value })}
                    className="rounded-md border border-line bg-white px-1.5 py-1 text-[10px] font-bold"
                  >
                    <option value="user">مزايد</option>
                    <option value="admin">مدير</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={pendingId === user.id}
                    onClick={() => patch(user.id, { status: user.status === "active" ? "suspended" : "active" })}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${user.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                  >
                    {user.status === "active" ? "نشط — إيقاف" : "موقوف — تنشيط"}
                  </button>
                </td>
                <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InvoiceManager({ invoices }: { invoices: AdminInvoiceRow[] }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const totals = invoices.reduce(
    (acc, invoice) => {
      acc.total += invoice.total;
      if (invoice.status === "paid") acc.paid += invoice.total;
      else acc.due += invoice.total;
      acc.fees += invoice.buyerFee + invoice.docFee;
      return acc;
    },
    { total: 0, paid: 0, due: 0, fees: 0 },
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "إجمالي الفواتير", value: formatMoney(totals.total) },
          { label: "محصّل", value: formatMoney(totals.paid) },
          { label: "مستحق", value: formatMoney(totals.due) },
          { label: "عمولات ورسوم", value: formatMoney(totals.fees) },
        ].map((item) => (
          <div key={item.label} className="card p-3">
            <p className="text-[10px] font-bold text-ink-600">{item.label}</p>
            <p className="mt-1 text-lg font-extrabold text-ink-950">{item.value}</p>
          </div>
        ))}
      </div>
      <FeedbackBanner feedback={feedback} />
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-cream-50 text-[10px] text-ink-600">
            <tr>
              <th className="px-3 py-2 text-start font-bold">الفاتورة</th>
              <th className="px-3 py-2 text-start font-bold">المشتري</th>
              <th className="px-3 py-2 text-start font-bold">السيارة</th>
              <th className="px-3 py-2 text-start font-bold">سعر البيع</th>
              <th className="px-3 py-2 text-start font-bold">العمولة</th>
              <th className="px-3 py-2 text-start font-bold">الإجمالي</th>
              <th className="px-3 py-2 text-start font-bold">الاستحقاق</th>
              <th className="px-3 py-2 text-start font-bold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-cream-50">
                <td className="px-3 py-2 font-mono text-[10px] font-bold" dir="ltr">{invoice.number}</td>
                <td className="px-3 py-2">
                  <p className="font-bold text-ink-950">{invoice.buyerName}</p>
                  <p className="text-[10px] text-ink-600" dir="ltr">{invoice.buyerEmail}</p>
                </td>
                <td className="px-3 py-2 text-[10px] text-ink-700">{invoice.vehicleLabel}<span className="block font-mono text-ink-600" dir="ltr">#{invoice.lotNumber}</span></td>
                <td className="px-3 py-2 font-bold text-ink-950">{formatMoney(invoice.hammerPrice)}</td>
                <td className="px-3 py-2 text-ink-700">{formatMoney(invoice.buyerFee + invoice.docFee)}</td>
                <td className="px-3 py-2 font-extrabold text-ink-950">{formatMoney(invoice.total)}</td>
                <td className="px-3 py-2 text-[10px] text-ink-600">{formatDateTime(invoice.dueDate)}</td>
                <td className="px-3 py-2">
                  <select
                    value={invoice.status}
                    disabled={pendingId === invoice.id}
                    onChange={async (event) => {
                      setPendingId(invoice.id);
                      const response = await fetch(`/api/admin/invoices/${invoice.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: event.target.value }),
                      });
                      const data = (await response.json()) as { error?: string };
                      setFeedback(response.ok ? { tone: "success", message: "تم تحديث حالة الفاتورة" } : { tone: "danger", message: data.error ?? "تعذّر التحديث" });
                      router.refresh();
                      setPendingId(null);
                    }}
                    className="rounded-md border border-line bg-white px-1.5 py-1 text-[10px] font-bold"
                  >
                    {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {invoices.length === 0 ? <tr><td colSpan={8} className="px-3 py-8 text-center text-ink-600">لا فواتير صادرة بعد.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function NotificationComposer({ users }: { users: { id: number; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ userId: "", title: "", body: "", type: "info", link: "" });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setFeedback(null);
        const response = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, userId: form.userId ? Number(form.userId) : null }),
        });
        const data = (await response.json()) as { error?: string; sent?: number };
        setFeedback(response.ok ? { tone: "success", message: `تم إرسال الإشعار إلى ${data.sent ?? 0} مستخدم` } : { tone: "danger", message: data.error ?? "تعذّر الإرسال" });
        if (response.ok) {
          setForm({ userId: "", title: "", body: "", type: "info", link: "" });
          router.refresh();
        }
        setPending(false);
      }}
      className="card space-y-2.5 p-4"
    >
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Bell className="size-4 text-petrol-500" /> إنشاء إشعار</h2>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label><span className="field-label">المستلم</span>
          <select value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} className="field">
            <option value="">جميع المستخدمين النشطين</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </label>
        <label><span className="field-label">النوع</span>
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="field">
            <option value="info">عام</option>
            <option value="bid">مزايدة</option>
            <option value="win">فوز</option>
            <option value="payment">دفع</option>
            <option value="auction">مزاد</option>
          </select>
        </label>
      </div>
      <label><span className="field-label">العنوان *</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="field" /></label>
      <label><span className="field-label">النص *</span><textarea required rows={3} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className="field" /></label>
      <label><span className="field-label">رابط (اختياري)</span><input value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} className="field" dir="ltr" placeholder="/auctions/live" /></label>
      <FeedbackBanner feedback={feedback} />
      <button type="submit" disabled={pending} className="btn btn-ink w-full">{pending ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} إرسال الإشعار</button>
    </form>
  );
}

export function SettingsManager({
  settings,
}: {
  settings: {
    buyerFeePercent: number;
    minBuyerFee: number;
    docFee: number;
    sellerCommissionPercent: number;
    defaultIncrement: number;
    paymentDueDays: number;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    buyerFeePercent: String(settings.buyerFeePercent),
    minBuyerFee: String(settings.minBuyerFee),
    docFee: String(settings.docFee),
    sellerCommissionPercent: String(settings.sellerCommissionPercent),
    defaultIncrement: String(settings.defaultIncrement),
    paymentDueDays: String(settings.paymentDueDays),
  });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        const response = await fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerFeePercent: Number(form.buyerFeePercent),
            minBuyerFee: Number(form.minBuyerFee),
            docFee: Number(form.docFee),
            sellerCommissionPercent: Number(form.sellerCommissionPercent),
            defaultIncrement: Number(form.defaultIncrement),
            paymentDueDays: Number(form.paymentDueDays),
          }),
        });
        const data = (await response.json()) as { error?: string };
        setFeedback(response.ok ? { tone: "success", message: "تم حفظ إعدادات العمولات" } : { tone: "danger", message: data.error ?? "تعذّر الحفظ" });
        router.refresh();
        setPending(false);
      }}
      className="card space-y-2.5 p-4"
    >
      <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950"><Settings2 className="size-4 text-petrol-500" /> إعدادات العمولات والرسوم</h2>
      <p className="rounded-md bg-cream-100 px-2.5 py-2 text-[10px] leading-5 text-ink-600">
        تُطبَّق هذه القيم تلقائيًا على الفواتير الجديدة عند إغلاق المزادات، وتظهر للمزايد قبل تأكيد المزايدة.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <label><span className="field-label">عمولة المشتري %</span><input type="number" min={0} max={40} value={form.buyerFeePercent} onChange={(event) => setForm({ ...form, buyerFeePercent: event.target.value })} className="field" /></label>
        <label><span className="field-label">حد أدنى للعمولة ($)</span><input type="number" min={0} value={form.minBuyerFee} onChange={(event) => setForm({ ...form, minBuyerFee: event.target.value })} className="field" /></label>
        <label><span className="field-label">رسوم المستندات ($)</span><input type="number" min={0} value={form.docFee} onChange={(event) => setForm({ ...form, docFee: event.target.value })} className="field" /></label>
        <label><span className="field-label">عمولة البائع %</span><input type="number" min={0} max={40} value={form.sellerCommissionPercent} onChange={(event) => setForm({ ...form, sellerCommissionPercent: event.target.value })} className="field" /></label>
        <label><span className="field-label">الزيادة الافتراضية ($)</span><input type="number" min={1} value={form.defaultIncrement} onChange={(event) => setForm({ ...form, defaultIncrement: event.target.value })} className="field" /></label>
        <label><span className="field-label">مهلة السداد (أيام)</span><input type="number" min={1} max={60} value={form.paymentDueDays} onChange={(event) => setForm({ ...form, paymentDueDays: event.target.value })} className="field" /></label>
      </div>
      <FeedbackBanner feedback={feedback} />
      <button type="submit" disabled={pending} className="btn btn-outline w-full">{pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} حفظ الإعدادات</button>
    </form>
  );
}
