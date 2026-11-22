"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";

import { BODY_TYPES, MAKES } from "@/lib/constants";

export function SearchBar({ initialTerm = "" }: { initialTerm?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState(initialTerm);
  const [make, setMake] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (term.trim()) params.set("q", term.trim());
    if (make) params.set("make", make);
    if (yearFrom) params.set("yearFrom", yearFrom);
    if (bodyType) params.set("bodyType", bodyType);
    if (priceTo) params.set("priceTo", priceTo);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const reset = () => {
    setTerm("");
    setMake("");
    setYearFrom("");
    setBodyType("");
    setPriceTo("");
  };

  const years = Array.from({ length: 16 }, (_, index) => new Date().getFullYear() - index + 1);

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/15 bg-white p-3 shadow-2xl sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-extrabold text-ink-950">ابحث بين آلاف اللوتات</p>
        <button type="button" onClick={reset} className="flex items-center gap-1 text-[11px] font-bold text-ink-600 hover:text-ink-950">
          <RotateCcw className="size-3.5" /> إعادة تعيين
        </button>
      </div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <label className="lg:col-span-2">
          <span className="field-label">بحث حر (الشركة، الطراز، VIN، اللوت)</span>
          <div className="flex items-center rounded-lg border border-line bg-white focus-within:border-petrol-400">
            <Search className="mx-2.5 size-4 text-ink-600" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Toyota Camry، رقم لوت 58412..."
              className="w-full rounded-lg bg-transparent py-2 pe-2 text-sm outline-none"
            />
          </div>
        </label>
        <label>
          <span className="field-label">الشركة المصنعة</span>
          <select value={make} onChange={(event) => setMake(event.target.value)} className="field">
            <option value="">كل الشركات</option>
            {MAKES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">من سنة</span>
          <select value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} className="field">
            <option value="">أي سنة</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">نوع السيارة</span>
          <select value={bodyType} onChange={(event) => setBodyType(event.target.value)} className="field">
            <option value="">كل الأنواع</option>
            {BODY_TYPES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">أقصى مزايدة ($)</span>
          <input
            type="number"
            min={0}
            step={500}
            value={priceTo}
            onChange={(event) => setPriceTo(event.target.value)}
            placeholder="25,000"
            className="field"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn btn-ink flex-1 py-2.5">
          <Search className="size-4" /> عرض النتائج
        </button>
        <button type="button" onClick={() => router.push("/vehicles")} className="btn btn-outline py-2.5">
          تصفّح كل السيارات
        </button>
      </div>
    </form>
  );
}
