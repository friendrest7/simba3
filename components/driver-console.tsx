"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import {
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches, drivers } from "@/lib/data";
import { useStore } from "./store-provider";
import { DeliveryMap } from "./delivery-map";

const statuses = ["Collected", "On the way", "Arrived", "Delivered"] as const;
type DeliveryStatus = typeof statuses[number];

type Delivery = {
  id: string;
  customer: string;
  phone: string;
  area: string;
  address: string;
  distance: number;
  eta: number;
  bags: number;
  value: number;
  status: DeliveryStatus;
  paid: boolean;
};

const initialDeliveries: Delivery[] = [
  { id: "SMB-48219", customer: "Aline M.", phone: "+250788220101", area: "Kimironko", address: "KG 11 Avenue, near the market", distance: 4.8, eta: 19, bags: 3, value: 18450, status: "On the way", paid: true },
  { id: "SMB-48227", customer: "Patrick N.", phone: "+250788220102", area: "Remera", address: "KN 5 Road, Airport View", distance: 7.2, eta: 31, bags: 2, value: 12700, status: "Collected", paid: true },
  { id: "SMB-48231", customer: "Diane U.", phone: "+250788220103", area: "Kacyiru", address: "KG 7 Avenue, office reception", distance: 9.6, eta: 42, bags: 4, value: 26300, status: "Collected", paid: false },
];

export function DriverConsole() {
  const { user } = useStore();
  const branch = branches.find((item) => item.id === user?.branchId) || branches[0];
  const driver = drivers.find((item) => item.id === user?.driverId) || drivers.find((item) => item.branchId === branch.id) || drivers[0];
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [hydrated, setHydrated] = useState(false);
  const [activeId, setActiveId] = useState(initialDeliveries[0].id);
  const [lastReport, setLastReport] = useState("Not reported this session");
  const [reporting, setReporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const active = deliveries.find((delivery) => delivery.id === activeId) || deliveries[0];

  useEffect(() => {
    const saved = window.localStorage.getItem("simba-driver-deliveries");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Delivery[];
        if (Array.isArray(parsed) && parsed.length) {
          setDeliveries(parsed);
          setActiveId(parsed.find((delivery) => delivery.status !== "Delivered")?.id || parsed[0].id);
        }
      } catch {
        window.localStorage.removeItem("simba-driver-deliveries");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("simba-driver-deliveries", JSON.stringify(deliveries));
  }, [deliveries, hydrated]);

  const completed = deliveries.filter((delivery) => delivery.status === "Delivered").length;
  const remainingDistance = deliveries.filter((delivery) => delivery.status !== "Delivered").reduce((sum, delivery) => sum + delivery.distance, 0);
  const collectedValue = deliveries.filter((delivery) => delivery.status === "Delivered").reduce((sum, delivery) => sum + delivery.value, 0);
  const progress = Math.round((completed / deliveries.length) * 100);

  const nextStatus = useMemo(() => {
    const index = statuses.indexOf(active.status);
    return statuses[Math.min(index + 1, statuses.length - 1)];
  }, [active.status]);

  function updateStatus(status: DeliveryStatus) {
    setDeliveries((items) => items.map((delivery) => delivery.id === active.id ? { ...delivery, status } : delivery));
    setNotice(status === "Delivered"
      ? `Delivery ${active.id} completed. The customer dashboard has been updated.`
      : `${active.customer} can now see that the order is "${status}".`);

    if (status === "Delivered") {
      const next = deliveries.find((delivery) => delivery.id !== active.id && delivery.status !== "Delivered");
      if (next) window.setTimeout(() => setActiveId(next.id), 700);
    }
  }

  function reportLocation() {
    setReporting(true);
    setNotice("");
    window.setTimeout(() => {
      const time = new Intl.DateTimeFormat("en-RW", { hour: "2-digit", minute: "2-digit" }).format(new Date());
      setLastReport(time);
      setReporting(false);
      setNotice(`Live location shared for order ${active.id}. Customer ETA refreshed.`);
    }, 700);
  }

  function saveNote() {
    if (!deliveryNote.trim()) return;
    setNotice(`Proof note saved for ${active.id}: "${deliveryNote.trim()}"`);
    setDeliveryNote("");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black text-[#16865c]">{branch.name}</p>
          <h2 className="mt-2 text-2xl font-black">Today&apos;s delivery shift</h2>
          <p className="mt-2 text-sm text-gray-500">{driver.name} &middot; {driver.vehicle} &middot; {driver.registration}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="flex h-10 items-center gap-2 rounded-md bg-[#16865c]/10 px-4 text-xs font-black text-[#16865c]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#16865c]" /> Shift online</span>
          <button onClick={reportLocation} disabled={reporting} className="button-primary !min-h-10 !bg-[#16865c] disabled:opacity-60"><LocateFixed className={`h-4 w-4 ${reporting ? "animate-pulse" : ""}`} /> {reporting ? "Reporting..." : "Report my location"}</button>
        </div>
      </div>

      {notice && (
        <div className="mt-5 flex items-start gap-3 rounded-md border border-[#16865c]/25 bg-[#16865c]/10 p-4 text-sm text-[#116344]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>{notice}</p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-card"><Route className="h-5 w-5 text-brand" /><p className="mt-4 text-xl font-black">{completed}/{deliveries.length}</p><p className="mt-1 text-xs text-gray-500">Stops completed</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} /></div></div>
        <div className="dashboard-card"><Navigation className="h-5 w-5 text-[#3867d6]" /><p className="mt-4 text-xl font-black">{remainingDistance.toFixed(1)} km</p><p className="mt-1 text-xs text-gray-500">Remaining distance</p></div>
        <div className="dashboard-card"><LocateFixed className="h-5 w-5 text-[#16865c]" /><p className="mt-4 text-xl font-black">{lastReport}</p><p className="mt-1 text-xs text-gray-500">Last location report</p></div>
        <div className="dashboard-card"><CircleDollarSign className="h-5 w-5 text-[#d97706]" /><p className="mt-4 text-xl font-black">FRw {collectedValue.toLocaleString()}</p><p className="mt-1 text-xs text-gray-500">Delivered order value</p></div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="dashboard-card h-fit">
          <div className="flex items-center justify-between"><div><h3 className="font-black">Delivery queue</h3><p className="mt-1 text-[10px] text-gray-500">Select the stop you are working on.</p></div><span className="rounded-full bg-brand/10 px-2 py-1 text-[10px] font-black text-brand">{deliveries.length} stops</span></div>
          <div className="mt-4 space-y-2">
            {deliveries.map((delivery, index) => (
              <button key={delivery.id} onClick={() => { setActiveId(delivery.id); setNotice(""); }} className={`w-full rounded-md border p-3 text-left transition ${active.id === delivery.id ? "border-brand bg-brand/5" : "border-black/10 hover:border-brand/40 dark:border-white/10"}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black text-gray-400">STOP {index + 1} &middot; #{delivery.id}</p><p className="mt-1 text-xs font-black">{delivery.customer} &middot; {delivery.area}</p></div>{delivery.status === "Delivered" ? <CheckCircle2 className="h-4 w-4 text-[#16865c]" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}</div>
                <div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-gray-500">{delivery.distance} km &middot; {delivery.eta} min</span><span className={`font-black ${delivery.status === "Delivered" ? "text-[#16865c]" : "text-brand"}`}>{delivery.status}</span></div>
              </button>
            ))}
          </div>
        </section>

        <div className="min-w-0">
          <section className="dashboard-card mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase text-brand">Active stop &middot; #{active.id}</p><h3 className="mt-2 text-xl font-black">{active.customer}</h3><p className="mt-2 flex items-center gap-2 text-xs text-gray-500"><MapPin className="h-4 w-4" /> {active.address}, {active.area}</p></div>
              <div className="text-right"><p className="text-lg font-black">FRw {active.value.toLocaleString()}</p><p className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-[#16865c]"><ShieldCheck className="h-3.5 w-3.5" /> {active.paid ? "Paid online" : "Payment on delivery"}</p></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-black/[.035] p-3 dark:bg-white/[.05]"><PackageCheck className="h-4 w-4 text-brand" /><p className="mt-2 text-xs font-black">{active.bags} sealed bags</p><p className="mt-1 text-[10px] text-gray-500">Verified at dispatch</p></div>
              <div className="rounded-md bg-black/[.035] p-3 dark:bg-white/[.05]"><Clock3 className="h-4 w-4 text-[#3867d6]" /><p className="mt-2 text-xs font-black">{active.eta} minutes</p><p className="mt-1 text-[10px] text-gray-500">Current ETA</p></div>
              <div className="rounded-md bg-black/[.035] p-3 dark:bg-white/[.05]"><Truck className="h-4 w-4 text-[#16865c]" /><p className="mt-2 text-xs font-black">{active.status}</p><p className="mt-1 text-[10px] text-gray-500">Customer-visible status</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`tel:${active.phone}`} className="button-secondary !min-h-10 !px-4"><Phone className="h-4 w-4" /> Call customer</a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${active.address}, ${active.area}, Rwanda`)}`} target="_blank" rel="noopener noreferrer" className="button-secondary !min-h-10 !px-4"><Navigation className="h-4 w-4" /> Open navigation</a>
              {active.status !== "Delivered" && <button onClick={() => updateStatus(nextStatus)} className="button-primary !min-h-10 !px-4">{nextStatus === "Delivered" ? <CheckCircle2 className="h-4 w-4" /> : <Truck className="h-4 w-4" />} Mark {nextStatus}</button>}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <DeliveryMap branchId={branch.id} driverId={driver.id} />
            <section className="dashboard-card h-fit">
              <h3 className="font-black">Update delivery</h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">Every stage is immediately visible to the customer.</p>
              <div className="mt-5 space-y-2">
                {statuses.map((item) => <button key={item} onClick={() => updateStatus(item)} className={`flex h-11 w-full items-center gap-3 rounded-md border px-3 text-xs font-bold ${active.status === item ? "border-[#16865c] bg-[#16865c]/10 text-[#16865c]" : "border-black/10 dark:border-white/10"}`}>{active.status === item ? <CheckCircle2 className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}{item}</button>)}
              </div>
              <label className="mt-5 block text-xs font-black">Proof or delivery note</label>
              <textarea value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-line bg-transparent p-3 text-xs outline-none focus:border-brand" placeholder="Example: Handed to customer at reception." />
              <button onClick={saveNote} disabled={!deliveryNote.trim()} className="button-secondary mt-3 w-full !min-h-10 disabled:opacity-40">Save delivery note</button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
