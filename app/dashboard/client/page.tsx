"use client";

import Image from "next/image";
import { BadgeCheck, CheckCircle2, Clock3, Heart, MapPin, Package, Phone, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DeliveryMap } from "@/components/delivery-map";
import { ReviewForm } from "@/components/review-form";
import { StatCard } from "@/components/stat-card";
import { deliverySteps } from "@/lib/data";
import { branches, demoDelivery, drivers } from "@/lib/data";
import { useStore } from "@/components/store-provider";

export default function ClientDashboard() {
  const { savedProductIds } = useStore();
  const branch = branches.find((item) => item.id === demoDelivery.branchId) || branches[0];
  const driver = drivers.find((item) => item.id === demoDelivery.driverId) || drivers[0];
  return <DashboardShell role="client">
    <div className="mb-8"><h2 className="text-2xl font-black">Good morning. Your market is moving.</h2><p className="mt-2 text-sm text-gray-500">Here is the latest on your orders and deliveries.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard icon={ShoppingBag} label="Total orders" value="12" trend="+2 this month" /><StatCard icon={Truck} label="Active deliveries" value="2" trend="Arriving soon" /><StatCard icon={Heart} label="Saved products" value={String(savedProductIds.length)} trend={savedProductIds.length ? "Ready for your next basket" : "Save products while shopping"} /></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <section className="dashboard-card"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase text-brand">Paid delivery</p><h3 className="mt-1 font-black">Order #{demoDelivery.id}</h3></div><span className="rounded-sm bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{demoDelivery.status}</span></div><div className="mt-6 flex gap-4 border-y border-black/10 py-5 dark:border-white/10"><div className="relative h-16 w-20 overflow-hidden rounded-md"><Image src="/images/5.jpg" alt="Strawberries" fill className="object-cover" /></div><div className="min-w-0 flex-1"><p className="text-sm font-black">Fresh market basket</p><p className="mt-1 text-xs text-gray-500">Fulfilled by {branch.name}</p><p className="mt-2 text-xs font-bold">Estimated {demoDelivery.eta}</p></div><span className="hidden items-center gap-1 text-[10px] font-black text-[#16865c] sm:flex"><ShieldCheck className="h-4 w-4" /> Delivery paid</span></div><div className="mt-6 grid grid-cols-5">{deliverySteps.map((step, i) => <div className="relative text-center" key={step}><div className={`relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full ${i <= 3 ? "bg-brand text-white" : "bg-gray-200 text-gray-400"}`}>{i < 3 ? <CheckCircle2 className="h-4 w-4" /> : i === 3 ? <Truck className="h-4 w-4" /> : <Package className="h-4 w-4" />}</div>{i < 4 && <div className={`absolute left-1/2 top-4 h-0.5 w-full ${i < 3 ? "bg-brand" : "bg-gray-200"}`} />}<p className="mt-3 hidden text-[10px] font-bold sm:block">{step}</p></div>)}</div></section>
      <section className="dashboard-card"><h3 className="font-black">Recent activity</h3><div className="mt-5 space-y-5">{[["Order confirmed", "Order #SMB-48219", "2h"],["Package dispatched", "Order #SMB-47902", "Yesterday"],["Order delivered", "Order #SMB-47311", "Jun 4"]].map(([title, detail, time]) => <div key={detail} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><Clock3 className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-black">{title}</p><p className="mt-1 text-[11px] text-gray-500">{detail} · {time}</p></div></div>)}</div></section>
    </div>
    <section className="dashboard-card mt-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-[#d94b1b]/10 text-[#d94b1b]"><Truck className="h-5 w-5" /></span><div><p className="text-xs font-black">{driver.name}</p><p className="mt-1 text-[10px] text-gray-500">{driver.vehicle} · {driver.registration}</p></div></div>
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-[#3867d6]/10 text-[#3867d6]"><MapPin className="h-5 w-5" /></span><div><p className="text-xs font-black">{branch.city} branch</p><p className="mt-1 text-[10px] text-gray-500">{branch.address}</p></div></div>
        <div className="flex items-center gap-3 sm:justify-end"><a href={`tel:${driver.phone}`} className="flex h-10 items-center gap-2 rounded-md bg-[#16865c] px-4 text-xs font-black text-white"><Phone className="h-4 w-4" /> Call driver</a><span className="flex items-center gap-1 text-[10px] font-bold text-[#16865c]"><BadgeCheck className="h-4 w-4" /> Verified</span></div>
      </div>
    </section>
    <div className="mt-6"><DeliveryMap branchId={branch.id} driverId={driver.id} authorized={demoDelivery.paid && demoDelivery.deliveryFeePaid} /></div>
    <p className="mt-3 text-center text-[10px] text-gray-500">Live driver location is shared only for your paid active delivery and ends after the order is delivered.</p>
    <ReviewForm defaultOrderId={demoDelivery.id} defaultBranchId={branch.id} defaultFulfilmentMethod="delivery" />
  </DashboardShell>;
}
