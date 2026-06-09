"use client";

import { LockKeyhole, MapPin, Navigation, Phone, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches, drivers } from "@/lib/data";

const route = [
  { left: 18, top: 72, area: "Simba KIC", eta: 28, coords: "-1.9441, 30.0619" },
  { left: 30, top: 63, area: "Kiyovu", eta: 24, coords: "-1.9503, 30.0678" },
  { left: 43, top: 56, area: "Kacyiru", eta: 19, coords: "-1.9448, 30.0885" },
  { left: 56, top: 45, area: "Gishushu", eta: 14, coords: "-1.9536, 30.0935" },
  { left: 69, top: 37, area: "Remera", eta: 9, coords: "-1.9577, 30.1094" },
  { left: 81, top: 25, area: "Customer neighbourhood", eta: 4, coords: "-1.9499, 30.1265" },
];

export function DeliveryMap({ compact = false, branchId = "kigali-kic", driverId = "drv-101", authorized = true }: { compact?: boolean; branchId?: string; driverId?: string; authorized?: boolean }) {
  const [step, setStep] = useState(2);
  const current = route[step];
  const progress = useMemo(() => Math.round(((step + 1) / route.length) * 100), [step]);
  const branch = branches.find((item) => item.id === branchId) || branches[0];
  const driver = drivers.find((item) => item.id === driverId) || drivers.find((item) => item.branchId === branch.id) || drivers[0];

  useEffect(() => {
    const timer = window.setInterval(() => setStep((value) => value < route.length - 1 ? value + 1 : 2), 7000);
    return () => window.clearInterval(timer);
  }, []);

  if (!authorized) return (
    <section className="grid min-h-72 place-items-center rounded-md border border-line bg-canvas p-8 text-center">
      <div><LockKeyhole className="mx-auto h-10 w-10 text-muted" /><h3 className="mt-4 font-black">Driver location is protected</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">Live driver access becomes available after the delivery fee is paid and a driver is assigned.</p></div>
    </section>
  );

  return (
    <section className="overflow-hidden rounded-md border border-black/10 bg-white dark:border-white/10 dark:bg-[#1b1c20]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 p-5 dark:border-white/10">
        <div>
          <p className="text-[10px] font-black uppercase text-[#16865c]">Live driver location</p>
          <h3 className="mt-1 font-black">Order #SMB-48219</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-md bg-[#16865c]/10 px-3 py-2 text-xs font-bold text-[#16865c]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#16865c]" /> Updating live
          </span>
          {!compact && <button className="grid h-9 w-9 place-items-center rounded-md border border-black/10 text-[#16865c] dark:border-white/10" title="Call driver"><Phone className="h-4 w-4" /></button>}
        </div>
      </div>

      <div className={`relative overflow-hidden bg-[#e9ece5] ${compact ? "h-64" : "h-[390px]"}`}>
        <iframe
          title="Google Map showing Simba delivery area"
          src={`https://www.google.com/maps?q=${branch.coordinates.lat},${branch.coordinates.lng}&z=14&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 bg-white/5" />
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1800ms] ease-in-out"
          style={{ left: `${current.left}%`, top: `${current.top}%` }}
        >
          <span className="relative grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-[#d94b1b] text-white shadow-[0_6px_20px_rgba(0,0,0,.3)]">
            <Truck className="h-5 w-5" />
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#d94b1b]/40" />
          </span>
        </div>
        <div className="absolute right-[15%] top-[18%] z-10">
          <span className="grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-[#16865c] text-white shadow-lg"><MapPin className="h-5 w-5" /></span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 z-20 rounded-md bg-white/95 p-4 text-[#18191c] shadow-lg backdrop-blur sm:left-5 sm:right-auto sm:w-80">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#d94b1b]/10 text-[#d94b1b]"><Navigation className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3"><p className="truncate text-sm font-black">{driver.name} is on the way</p><b className="text-sm text-[#16865c]">{current.eta} min</b></div>
              <p className="mt-1 text-xs text-gray-500">{branch.city} route · {current.coords}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#16865c] transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
