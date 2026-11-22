"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Filter, RotateCcw, X } from "lucide-react";

import {
  BODY_TYPES,
  CONDITIONS,
  COUNTRIES,
  DAMAGE_TYPES,
  FUEL_TYPES,
  LOCATION_CITIES,
  MAKES,
  SORT_OPTIONS,
  TRANSMISSIONS,
} from "@/lib/constants";
import { EMPTY_FILTERS, type VehicleFilters } from "@/lib/filters";

type Props = {
  initial: VehicleFilters;
  basePath?: string;
  forcedParams?: Record<string, string>;
  variant?: "sidebar" | "bar";
};

export function FiltersPanel({ initial, basePath = "/vehicles", forcedParams = {}, variant = "sidebar" }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({
    q: initial.q,
    make: initial.make,
    model: initial.model,
    bodyType: initial.bodyType,
    fuelType: initial.fuelType,
    transmission: initial.transmission,
    condition: initial.condition,
    damageType: initial.damageType,
    locationCountry: initial.locationCountry,
    locationCity: initial.locationCity,
    vin: initial.vin,
    lot: initial.lot,
    yearFrom: initial.yearFrom,
    yearTo: initial.yearTo,
    priceFrom: initial.priceFrom,
    priceTo: initial.priceTo,
    sort: initial.sort || "ending",
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const activeCount = useMemo(
    () =>
      Object.entries(values).filter(([key, value]) => key !== "sort" && value !== "" && value !== undefined).length,
    [values],
  );

  const apply = (event?: React.FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (!value) continue;
      if (key === "sort" && value === "ending") continue;
      params.set(key, value);
    }
    for (const [key, value] of Object.entries(forcedParams)) params.set(key, value);
    params.delete("page");
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
    setMobileOpen(false);
  };

  const reset = () => {
    setValues({
      q: "",
      make: "",
      model: "",
      bodyType: "",
      fuelType: "",
      transmission: "",
      condition: "",
      damageType: "",
      locationCountry: "",
      locationCity: "",
      vin: "",
      lot: "",
      yearFrom: "",
      yearTo: "",
      priceFrom: "",
      priceTo: "",
      sort: initial.sort || "ending",
    });
    const params = new URLSearchParams(forcedParams);
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const cities = values.locationCountry ? LOCATION_CITIES[values.locationCountry] ?? [] : [];

  const sections = [
    {
      title: "البحث المباشر",
      body: (
        <div className="space-y-2.5">
          <label>
            <span className="field-label">بحث حر</span>
            <input value={values.q} onChange={(event) => update("q", event.target.value)} placeholder="الشركة، الطراز..." className="field" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="field-label">رقم اللوت</span>
              <input value={values.lot} onChange={(event) => update("lot", event.target.value)} placeholder="58412207" className="field" dir="ltr" />
            </label>
            <label>
              <span className="field-label">VIN</span>
              <input value={values.vin} onChange={(event) => update("vin", event.target.value)} placeholder="4T1BF1..." className="field" dir="ltr" />
            </label>
          </div>
        </div>
      ),
    },
    {
      title: "بيانات السيارة",
      body: (
        <div className="space-y-2.5">
          <label>
            <span className="field-label">الشركة المصنعة</span>
            <select value={values.make} onChange={(event) => update("make", event.target.value)} className="field">
              <option value="">كل الشركات</option>
              {MAKES.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">الطراز</span>
            <input value={values.model} onChange={(event) => update("model", event.target.value)} placeholder="Camry, Civic..." className="field" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="field-label">من سنة</span>
              <input type="number" min={1950} max={2030} value={values.yearFrom} onChange={(event) => update("yearFrom", event.target.value)} placeholder="2018" className="field" />
            </label>
            <label>
              <span className="field-label">إلى سنة</span>
              <input type="number" min={1950} max={2030} value={values.yearTo} onChange={(event) => update("yearTo", event.target.value)} placeholder="2024" className="field" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="field-label">نوع الوقود</span>
              <select value={values.fuelType} onChange={(event) => update("fuelType", event.target.value)} className="field">
                <option value="">الكل</option>
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">ناقل الحركة</span>
              <select value={values.transmission} onChange={(event) => update("transmission", event.target.value)} className="field">
                <option value="">الكل</option>
                {TRANSMISSIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span className="field-label">نوع السيارة</span>
            <select value={values.bodyType} onChange={(event) => update("bodyType", event.target.value)} className="field">
              <option value="">كل الأنواع</option>
              {BODY_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">حالة التشغيل</span>
            <select value={values.condition} onChange={(event) => update("condition", event.target.value)} className="field">
              <option value="">كل الحالات</option>
              {CONDITIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      ),
    },
    {
      title: "الأضرار والموقع",
      body: (
        <div className="space-y-2.5">
          <label>
            <span className="field-label">نوع الضرر</span>
            <select value={values.damageType} onChange={(event) => update("damageType", event.target.value)} className="field">
              <option value="">كل الأنواع</option>
              {DAMAGE_TYPES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">بلد السيارة</span>
            <select
              value={values.locationCountry}
              onChange={(event) => {
                update("locationCountry", event.target.value);
                update("locationCity", "");
              }}
              className="field"
            >
              <option value="">كل البلدان</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">مدينة السيارة</span>
            <select value={values.locationCity} onChange={(event) => update("locationCity", event.target.value)} className="field" disabled={!cities.length}>
              <option value="">كل المدن</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
        </div>
      ),
    },
    {
      title: "السعر والترتيب",
      body: (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <label>
              <span className="field-label">من ($)</span>
              <input type="number" min={0} value={values.priceFrom} onChange={(event) => update("priceFrom", event.target.value)} placeholder="0" className="field" />
            </label>
            <label>
              <span className="field-label">إلى ($)</span>
              <input type="number" min={0} value={values.priceTo} onChange={(event) => update("priceTo", event.target.value)} placeholder="50000" className="field" />
            </label>
          </div>
          <label>
            <span className="field-label">ترتيب النتائج</span>
            <select value={values.sort} onChange={(event) => update("sort", event.target.value)} className="field">
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      ),
    },
  ];

  const content = (
    <form onSubmit={apply}>
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink-950">
          <Filter className="size-4 text-petrol-500" /> فلاتر البحث
          {activeCount > 0 ? (
            <span className="rounded-full bg-gold-500 px-1.5 text-[10px] font-extrabold text-ink-950">{activeCount}</span>
          ) : null}
        </p>
        <button type="button" onClick={reset} className="flex items-center gap-1 text-[11px] font-bold text-ink-600 hover:text-danger">
          <RotateCcw className="size-3.5" /> مسح
        </button>
      </div>
      <div className="divide-y divide-line">
        {sections.map((section, index) => (
          <details key={section.title} open={index < 2} className="group py-3">
            <summary className="flex cursor-pointer items-center justify-between text-xs font-extrabold text-ink-800">
              {section.title}
              <ChevronDown className="size-4 text-ink-600 transition group-open:rotate-180" />
            </summary>
            <div className="mt-2.5">{section.body}</div>
          </details>
        ))}
      </div>
      <button type="submit" className="btn btn-ink mt-3 w-full">
        تطبيق الفلاتر
      </button>
      <p className="mt-2 text-center text-[10px] text-ink-600">يمكن الجمع بين أكثر من فلتر في الوقت نفسه</p>
    </form>
  );

  if (variant === "bar") {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-ink-950">تصفية متقدمة</p>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="btn btn-outline px-3 py-1.5 text-xs"
          >
            {mobileOpen ? <X className="size-4" /> : <Filter className="size-4" />}
            {mobileOpen ? "إغلاق" : "فتح الفلاتر"}
            {activeCount > 0 ? <span className="rounded-full bg-gold-500 px-1.5 text-[10px] text-ink-950">{activeCount}</span> : null}
          </button>
        </div>
        {mobileOpen ? <div className="mt-3">{content}</div> : null}
      </div>
    );
  }

  return <aside className="card sticky top-32 p-4">{content}</aside>;
}

export const defaultFilters = EMPTY_FILTERS;
