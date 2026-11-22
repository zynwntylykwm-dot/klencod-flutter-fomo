"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, UploadCloud, X } from "lucide-react";

import type { AdminVehicleRow } from "@/lib/admin-queries";
import { BODY_TYPES, CONDITIONS, COUNTRIES, DAMAGE_TYPES, FUEL_TYPES, TRANSMISSIONS } from "@/lib/constants";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";

type Props = {
  vehicles: AdminVehicleRow[];
  auctions: { id: number; name: string; code: string }[];
};

const sampleImages = [
  "https://images.pexels.com/photos/16350068/pexels-photo-16350068.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/241190/pexels-photo-241190.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/33749906/pexels-photo-33749906.jpeg?auto=compress&cs=tinysrgb&w=1200",
].join("\n");

type FormState = {
  lotNumber: string;
  vin: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  condition: string;
  runCondition: string;
  damageType: string;
  damageDescription: string;
  keysPresent: boolean;
  titleStatus: string;
  seller: string;
  retailValue: string;
  repairCost: string;
  images: string;
  locationCity: string;
  locationCountry: string;
  auctionId: string;
  startingBid: string;
  reservePrice: string;
  minIncrement: string;
  status: string;
  auctionStart: string;
  auctionEnd: string;
};

const emptyForm = (auctions: Props["auctions"]): FormState => {
  const now = new Date();
  return {
    lotNumber: "",
    vin: "",
    make: "Toyota",
    model: "",
    trim: "",
    year: String(now.getFullYear()),
    mileage: "0",
    fuelType: FUEL_TYPES[0],
    transmission: TRANSMISSIONS[0],
    bodyType: BODY_TYPES[0],
    color: "أبيض",
    condition: CONDITIONS[0].value,
    runCondition: "يدور ويعمل",
    damageType: DAMAGE_TYPES[0],
    damageDescription: "",
    keysPresent: true,
    titleStatus: "سليم",
    seller: "مزاد مرخّص",
    retailValue: "20000",
    repairCost: "0",
    images: sampleImages,
    locationCity: "دالاس - تكساس",
    locationCountry: COUNTRIES[0],
    auctionId: auctions[0] ? String(auctions[0].id) : "",
    startingBid: "5000",
    reservePrice: "",
    minIncrement: "100",
    status: "upcoming",
    auctionStart: now.toISOString().slice(0, 16),
    auctionEnd: new Date(now.getTime() + 86400000).toISOString().slice(0, 16),
  };
};

const toForm = (vehicle: AdminVehicleRow): FormState => ({
  lotNumber: vehicle.lotNumber,
  vin: vehicle.vin,
  make: vehicle.make,
  model: vehicle.model,
  trim: vehicle.trim ?? "",
  year: String(vehicle.year),
  mileage: String(vehicle.mileage),
  fuelType: vehicle.fuelType,
  transmission: vehicle.transmission,
  bodyType: vehicle.bodyType,
  color: vehicle.color,
  condition: vehicle.condition,
  runCondition: vehicle.runCondition,
  damageType: vehicle.damageType,
  damageDescription: vehicle.damageDescription,
  keysPresent: vehicle.keysPresent,
  titleStatus: vehicle.titleStatus,
  seller: vehicle.seller,
  retailValue: String(vehicle.retailValue),
  repairCost: String(vehicle.repairCost),
  images: (vehicle.images ?? []).join("\n"),
  locationCity: vehicle.locationCity,
  locationCountry: vehicle.locationCountry,
  auctionId: vehicle.auctionId ? String(vehicle.auctionId) : "",
  startingBid: String(vehicle.startingBid),
  reservePrice: vehicle.reservePrice ? String(vehicle.reservePrice) : "",
  minIncrement: String(vehicle.minIncrement),
  status: vehicle.status,
  auctionStart: new Date(vehicle.auctionStart).toISOString().slice(0, 16),
  auctionEnd: new Date(vehicle.auctionEnd).toISOString().slice(0, 16),
});

export function VehicleManager({ vehicles, auctions }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(auctions));
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((vehicle) =>
      [vehicle.lotNumber, vehicle.vin, vehicle.make, vehicle.model, vehicle.status, vehicle.locationCity]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [vehicles, search]);

  const update = (key: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(auctions));
    setShowForm(true);
    setFeedback(null);
  };

  const openEdit = (vehicle: AdminVehicleRow) => {
    setEditingId(vehicle.id);
    setForm(toForm(vehicle));
    setShowForm(true);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const payload = {
      ...form,
      year: Number(form.year),
      mileage: Number(form.mileage),
      retailValue: Number(form.retailValue),
      repairCost: Number(form.repairCost),
      startingBid: Number(form.startingBid),
      reservePrice: form.reservePrice ? Number(form.reservePrice) : null,
      minIncrement: Number(form.minIncrement),
      auctionId: form.auctionId ? Number(form.auctionId) : null,
      images: form.images.split("\n").map((value) => value.trim()).filter(Boolean),
      auctionStart: new Date(form.auctionStart).toISOString(),
      auctionEnd: new Date(form.auctionEnd).toISOString(),
    };
    const response = await fetch(editingId ? `/api/vehicles/${editingId}` : "/api/vehicles", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setFeedback({ tone: "danger", message: data.error ?? "تعذّر الحفظ" });
    } else {
      setFeedback({ tone: "success", message: editingId ? "تم تحديث بيانات اللوت" : "تمت إضافة اللوت بنجاح" });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm(auctions));
      router.refresh();
    }
    setPending(false);
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setFeedback(null);
    const body = new FormData();
    Array.from(files).forEach((file) => body.append("files", file));
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await response.json()) as { urls?: string[]; error?: string };
    if (response.ok && data.urls?.length) {
      setForm((current) => ({
        ...current,
        images: [current.images.trim(), ...data.urls!].filter(Boolean).join("\n"),
      }));
      setFeedback({ tone: "success", message: `تم رفع ${data.urls.length} صورة وإضافتها للوت` });
    } else {
      setFeedback({ tone: "danger", message: data.error ?? "تعذّر رفع الصور" });
    }
    setUploading(false);
  };

  const remove = async (vehicle: AdminVehicleRow) => {
    if (!window.confirm(`هل تريد حذف اللوت ${vehicle.lotNumber}؟ سيتم حذف مزايداته ومفضلته أيضًا.`)) return;
    setPending(true);
    const response = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    setFeedback(response.ok ? { tone: "success", message: "تم حذف اللوت" } : { tone: "danger", message: data.error ?? "تعذّر الحذف" });
    router.refresh();
    setPending(false);
  };

  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3">
        <div>
          <h1 className="text-sm font-extrabold text-ink-950">إدارة السيارات ({vehicles.length})</h1>
          <p className="text-[10px] text-ink-600">إضافة وتعديل وحذف اللوتات، مع الصور والأسعار ومواعيد المزاد.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-line bg-cream-50">
            <Search className="mx-2 size-3.5 text-ink-600" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث باللوت أو VIN أو الماركة" className="w-44 bg-transparent py-1.5 text-[11px] outline-none" />
          </div>
          <button type="button" onClick={openCreate} className="btn btn-gold text-xs"><Plus className="size-3.5" /> إضافة سيارة</button>
        </div>
      </div>

      {feedback ? (
        <p className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${feedback.tone === "success" ? "bg-success/10 text-[#12603f]" : "bg-danger/10 text-danger"}`}>
          {feedback.tone === "success" ? <CheckCircle2 className="size-3.5" /> : <AlertCircle className="size-3.5" />} {feedback.message}
        </p>
      ) : null}

      {showForm ? (
        <form onSubmit={submit} className="card space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink-950">{editingId ? `تعديل اللوت #${form.lotNumber}` : "إضافة سيارة جديدة"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md p-1 text-ink-600 hover:bg-cream-100" aria-label="إغلاق"><X className="size-4" /></button>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <label><span className="field-label">رقم اللوت *</span><input required value={form.lotNumber} onChange={(event) => update("lotNumber", event.target.value)} className="field" dir="ltr" /></label>
            <label><span className="field-label">رقم الهيكل VIN *</span><input required value={form.vin} onChange={(event) => update("vin", event.target.value)} className="field" dir="ltr" /></label>
            <label><span className="field-label">الحالة</span>
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className="field">
                <option value="upcoming">قادم</option>
                <option value="live">مباشر</option>
                <option value="sold">مباع</option>
                <option value="ended">منتهي</option>
              </select>
            </label>
            <label><span className="field-label">الشركة المصنعة *</span><input required value={form.make} onChange={(event) => update("make", event.target.value)} className="field" /></label>
            <label><span className="field-label">الطراز *</span><input required value={form.model} onChange={(event) => update("model", event.target.value)} className="field" /></label>
            <label><span className="field-label">الفئة</span><input value={form.trim} onChange={(event) => update("trim", event.target.value)} className="field" /></label>
            <label><span className="field-label">سنة الصنع *</span><input required type="number" min={1950} max={2030} value={form.year} onChange={(event) => update("year", event.target.value)} className="field" /></label>
            <label><span className="field-label">العداد (كم) *</span><input required type="number" min={0} value={form.mileage} onChange={(event) => update("mileage", event.target.value)} className="field" /></label>
            <label><span className="field-label">اللون *</span><input required value={form.color} onChange={(event) => update("color", event.target.value)} className="field" /></label>
            <label><span className="field-label">الوقود</span>
              <select value={form.fuelType} onChange={(event) => update("fuelType", event.target.value)} className="field">
                {FUEL_TYPES.map((fuel) => <option key={fuel} value={fuel}>{fuel}</option>)}
              </select>
            </label>
            <label><span className="field-label">ناقل الحركة</span>
              <select value={form.transmission} onChange={(event) => update("transmission", event.target.value)} className="field">
                {TRANSMISSIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label><span className="field-label">نوع السيارة</span>
              <select value={form.bodyType} onChange={(event) => update("bodyType", event.target.value)} className="field">
                {BODY_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label><span className="field-label">حالة التشغيل</span>
              <select value={form.condition} onChange={(event) => update("condition", event.target.value)} className="field">
                {CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label><span className="field-label">وصف حالة التشغيل</span><input value={form.runCondition} onChange={(event) => update("runCondition", event.target.value)} className="field" /></label>
            <label><span className="field-label">نوع الضرر</span>
              <select value={form.damageType} onChange={(event) => update("damageType", event.target.value)} className="field">
                {DAMAGE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label><span className="field-label">حالة الملكية</span><input value={form.titleStatus} onChange={(event) => update("titleStatus", event.target.value)} className="field" /></label>
            <label><span className="field-label">البائع</span><input value={form.seller} onChange={(event) => update("seller", event.target.value)} className="field" /></label>
            <label><span className="field-label">المفاتيح</span>
              <select value={form.keysPresent ? "yes" : "no"} onChange={(event) => update("keysPresent", event.target.value === "yes")} className="field">
                <option value="yes">متوفرة</option>
                <option value="no">غير متوفرة</option>
              </select>
            </label>
            <label><span className="field-label">البلد</span>
              <select value={form.locationCountry} onChange={(event) => update("locationCountry", event.target.value)} className="field">
                {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </label>
            <label><span className="field-label">المدينة *</span><input required value={form.locationCity} onChange={(event) => update("locationCity", event.target.value)} className="field" /></label>
            <label><span className="field-label">المزاد</span>
              <select value={form.auctionId} onChange={(event) => update("auctionId", event.target.value)} className="field">
                <option value="">بدون مزاد</option>
                {auctions.map((auction) => <option key={auction.id} value={auction.id}>{auction.name} ({auction.code})</option>)}
              </select>
            </label>
            <label><span className="field-label">قيمة السوق ($)</span><input type="number" min={0} value={form.retailValue} onChange={(event) => update("retailValue", event.target.value)} className="field" /></label>
            <label><span className="field-label">تكلفة الإصلاح ($)</span><input type="number" min={0} value={form.repairCost} onChange={(event) => update("repairCost", event.target.value)} className="field" /></label>
            <label><span className="field-label">سعر البدء ($) *</span><input required type="number" min={0} value={form.startingBid} onChange={(event) => update("startingBid", event.target.value)} className="field" /></label>
            <label><span className="field-label">السعر الاحتياطي ($)</span><input type="number" min={0} value={form.reservePrice} onChange={(event) => update("reservePrice", event.target.value)} className="field" /></label>
            <label><span className="field-label">أقل زيادة ($) *</span><input required type="number" min={1} value={form.minIncrement} onChange={(event) => update("minIncrement", event.target.value)} className="field" /></label>
            <label><span className="field-label">بداية المزاد (UTC)</span><input required type="datetime-local" value={form.auctionStart} onChange={(event) => update("auctionStart", event.target.value)} className="field" /></label>
            <label><span className="field-label">نهاية المزاد (UTC)</span><input required type="datetime-local" value={form.auctionEnd} onChange={(event) => update("auctionEnd", event.target.value)} className="field" /></label>
          </div>

          <label className="block">
            <span className="field-label">وصف الأضرار *</span>
            <textarea required rows={3} value={form.damageDescription} onChange={(event) => update("damageDescription", event.target.value)} className="field" placeholder="صدام أمامي وغطاء محرك متضرران..." />
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="field-label mb-0 flex items-center gap-1"><ImagePlus className="size-3.5 text-petrol-500" /> صور السيارة *</span>
              <label className={`btn btn-outline cursor-pointer text-[11px] ${uploading ? "opacity-60" : ""}`}>
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                {uploading ? "جارٍ الرفع..." : "رفع صور من الجهاز"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" disabled={uploading} onChange={(event) => uploadImages(event.target.files)} />
              </label>
            </div>
            <textarea required rows={4} value={form.images} onChange={(event) => update("images", event.target.value)} className="field font-mono text-[10px]" dir="ltr" placeholder="https://... أو /api/uploads/..." />
            <div className="flex flex-wrap gap-1.5">
              {form.images.split("\n").map((image) => image.trim()).filter(Boolean).map((image, index) => (
                <span key={`${image}-${index}`} className="relative overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="size-14 object-cover" />
                </span>
              ))}
            </div>
            <p className="text-[10px] text-ink-600">يمكنك رفع حتى 8 صور (JPG/PNG/WEBP، 6 ميجابايت كحد أقصى لكل صورة) أو لصق روابط الصور مباشرة.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={pending} className="btn btn-ink">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {editingId ? "حفظ التعديلات" : "إضافة اللوت"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn btn-outline">إلغاء</button>
          </div>
        </form>
      ) : null}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-cream-50 text-[10px] text-ink-600">
              <tr>
                <th className="px-3 py-2 text-start font-bold">السيارة</th>
                <th className="px-3 py-2 text-start font-bold">اللوت / VIN</th>
                <th className="px-3 py-2 text-start font-bold">المزاد</th>
                <th className="px-3 py-2 text-start font-bold">الحالة</th>
                <th className="px-3 py-2 text-start font-bold">أعلى مزايدة</th>
                <th className="px-3 py-2 text-start font-bold">ينتهي</th>
                <th className="px-3 py-2 text-start font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-cream-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={vehicle.images?.[0] ?? "/images/hero-yard.jpg"} alt="" className="size-9 rounded object-cover" loading="lazy" />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink-950">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-[10px] text-ink-600">{formatNumber(vehicle.mileage)} كم · {vehicle.damageType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-mono text-[10px] font-bold text-ink-900" dir="ltr">{vehicle.lotNumber}</p>
                    <p className="font-mono text-[9px] text-ink-600" dir="ltr">{vehicle.vin}</p>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-ink-700">{vehicle.auctionName ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${vehicle.status === "live" ? "bg-success/10 text-success" : vehicle.status === "sold" ? "bg-ink-900/10 text-ink-800" : "bg-cream-100 text-ink-700"}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-extrabold text-ink-950">{formatMoney(vehicle.currentBid)}</p>
                    <p className="text-[9px] text-ink-600">{formatNumber(vehicle.bidCount)} مزايدة</p>
                  </td>
                  <td className="px-3 py-2 text-[9px] text-ink-600">{formatDateTime(vehicle.auctionEnd)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(vehicle)} className="rounded-md border border-line p-1 text-petrol-500 hover:border-petrol-400" aria-label="تعديل"><Pencil className="size-3.5" /></button>
                      <button type="button" disabled={pending} onClick={() => remove(vehicle)} className="rounded-md border border-line p-1 text-danger hover:border-danger/50" aria-label="حذف"><Trash2 className="size-3.5" /></button>
                      <Link href={`/vehicles/${vehicle.id}`} className="rounded-md border border-line p-1 text-ink-700 hover:border-ink-700" aria-label="عرض"><Search className="size-3.5" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? <tr><td colSpan={7} className="px-3 py-8 text-center text-ink-600">لا نتائج مطابقة.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
