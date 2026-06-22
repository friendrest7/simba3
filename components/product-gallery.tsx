"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { ProductImage } from "./product-image";

export function ProductGallery({ image, name }: { image: string; name: string }) {
  const [zoomed, setZoomed] = useState(false);
  const views = [
    { label: "Front view", position: "object-center" },
    { label: "Detail view", position: "object-top" },
    { label: "Package view", position: "object-bottom" },
  ];
  const [selected, setSelected] = useState(0);
  const activeView = views[selected];

  function showPrevious() {
    setSelected((value) => (value === 0 ? views.length - 1 : value - 1));
  }

  function showNext() {
    setSelected((value) => (value + 1) % views.length);
  }

  return (
    <div>
      <button type="button" onClick={showNext} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-white" aria-label={`Show next ${name} image`}>
        <ProductImage key={selected} src={image} alt={`${name} ${activeView.label}`} fill priority className={`animate-[gallery-slide_.34s_ease-out] object-contain p-8 transition duration-500 group-hover:scale-105 ${activeView.position}`} sizes="(max-width: 1024px) 100vw, 60vw" />
        <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white">{activeView.label}</span>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-xs font-black text-white">Click to slide</span>
      </button>
      <div className="mt-3 grid grid-cols-[44px_1fr_44px] gap-3">
        <button type="button" onClick={showPrevious} className="grid min-h-11 place-items-center rounded-lg border border-line bg-canvas text-ink transition hover:border-brand hover:text-brand" aria-label="Previous image"><ChevronLeft className="h-5 w-5" /></button>
        <div className="grid grid-cols-3 gap-3">{views.map((view, index) => <button type="button" key={view.label} onClick={() => setSelected(index)} className={`relative aspect-[4/3] overflow-hidden rounded-lg border bg-white ${selected === index ? "border-brand ring-2 ring-brand/15" : "border-line"}`} aria-label={view.label}><ProductImage src={image} alt="" fill className={`object-contain p-3 ${view.position}`} sizes="160px" /></button>)}</div>
        <button type="button" onClick={showNext} className="grid min-h-11 place-items-center rounded-lg border border-line bg-canvas text-ink transition hover:border-brand hover:text-brand" aria-label="Next image"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <button type="button" onClick={() => setZoomed(true)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 text-xs font-black text-ink transition hover:border-brand hover:text-brand">
        <Search className="h-4 w-4" /> Zoom image
      </button>
      {zoomed && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={`${name} zoomed image`} onClick={() => setZoomed(false)}><button type="button" className="absolute right-4 top-4 min-h-11 rounded-full bg-white px-5 text-sm font-black text-black">Close</button><div className="relative h-[80vh] w-[min(95vw,1100px)]"><ProductImage src={image} alt={`${name} ${activeView.label}`} fill className={`object-contain ${activeView.position}`} sizes="95vw" /></div></div>}
    </div>
  );
}
