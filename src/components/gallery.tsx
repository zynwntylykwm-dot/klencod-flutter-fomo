"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const safeImages = images.length ? images : ["/images/hero-yard.jpg"];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const move = (direction: number) => {
    setActive((current) => (current + direction + safeImages.length) % safeImages.length);
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-ink-950">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={safeImages[active]} alt={`${alt} - صورة ${active + 1}`} className="aspect-[16/10] w-full object-cover" />
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="absolute end-3 top-3 flex items-center gap-1.5 rounded-md bg-ink-950/70 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur hover:bg-ink-950"
        >
          <ImageIcon className="size-3.5" /> عرض كامل
        </button>
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="الصورة السابقة"
          className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 shadow hover:bg-white"
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="الصورة التالية"
          className="absolute start-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-950 shadow hover:bg-white"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="absolute bottom-2 start-2 rounded bg-ink-950/70 px-2 py-1 text-[10px] font-bold text-white">
          {active + 1} / {safeImages.length}
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-5 gap-2">
        {safeImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`overflow-hidden rounded-md border-2 transition ${
              index === active ? "border-gold-500" : "border-transparent opacity-80 hover:opacity-100"
            }`}
            aria-label={`عرض الصورة ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {zoom ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950/95 p-4" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between text-white">
            <p className="text-sm font-bold">{alt}</p>
            <button type="button" onClick={() => setZoom(false)} className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="إغلاق">
              <X className="size-5" />
            </button>
          </div>
          <div className="relative mt-3 flex flex-1 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={safeImages[active]} alt={alt} className="max-h-full max-w-full rounded-lg object-contain" />
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute end-2 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink-950"
              aria-label="السابق"
            >
              <ChevronRight className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute start-2 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink-950"
              aria-label="التالي"
            >
              <ChevronLeft className="size-6" />
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-2 overflow-x-auto">
            {safeImages.map((image, index) => (
              <button key={`zoom-${index}`} type="button" onClick={() => setActive(index)} className={`h-14 w-20 overflow-hidden rounded border-2 ${index === active ? "border-gold-500" : "border-transparent opacity-70"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
