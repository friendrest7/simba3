"use client";

import { Search } from "lucide-react";
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

  return (
    <div>
      <button type="button" onClick={() => setZoomed(true)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-white" aria-label={`Zoom ${name} image`}>
        <ProductImage src={image} alt={`${name} ${views[selected].label}`} fill priority className={`object-contain p-8 transition duration-500 group-hover:scale-110 ${views[selected].position}`} sizes="(max-width: 1024px) 100vw, 60vw" />
        <span className="absolute bottom-4 right-4 flex min-h-11 items-center gap-2 rounded-full bg-black/75 px-4 text-xs font-black text-white"><Search className="h-4 w-4" /> Zoom</span>
      </button>
      <div className="mt-3 grid grid-cols-3 gap-3">{views.map((view, index) => <button type="button" key={view.label} onClick={() => setSelected(index)} className={`relative aspect-[4/3] overflow-hidden rounded-lg border bg-white ${selected === index ? "border-brand ring-2 ring-brand/15" : "border-line"}`} aria-label={view.label}><ProductImage src={image} alt="" fill className={`object-contain p-3 ${view.position}`} sizes="160px" /></button>)}</div>
      {zoomed && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={`${name} zoomed image`} onClick={() => setZoomed(false)}><button type="button" className="absolute right-4 top-4 min-h-11 rounded-full bg-white px-5 text-sm font-black text-black">Close</button><div className="relative h-[80vh] w-[min(95vw,1100px)]"><ProductImage src={image} alt={name} fill className="object-contain" sizes="95vw" /></div></div>}
    </div>
  );
}
