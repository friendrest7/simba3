"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Download,
  Globe2,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";

const periods = {
  "This month": 1,
  Quarter: 2.92,
  "Full year": 11.45,
} as const;

const africaMarkets = [
  { country: "Rwanda", region: "East Africa", stores: 9, orders: 15_840, revenueUsd: 634_000, growth: 12.4, fulfilment: 95.2, customers: 42_800, risk: "Low" },
  { country: "Kenya", region: "East Africa", stores: 14, orders: 28_900, revenueUsd: 1_318_000, growth: 16.8, fulfilment: 93.7, customers: 81_200, risk: "Low" },
  { country: "Uganda", region: "East Africa", stores: 7, orders: 12_460, revenueUsd: 492_000, growth: 10.1, fulfilment: 92.9, customers: 35_600, risk: "Watch" },
  { country: "Tanzania", region: "East Africa", stores: 11, orders: 21_780, revenueUsd: 926_000, growth: 14.5, fulfilment: 94.1, customers: 63_400, risk: "Low" },
  { country: "South Africa", region: "Southern Africa", stores: 19, orders: 46_320, revenueUsd: 2_864_000, growth: 8.7, fulfilment: 96.3, customers: 128_500, risk: "Low" },
  { country: "Zambia", region: "Southern Africa", stores: 6, orders: 10_240, revenueUsd: 438_000, growth: 9.6, fulfilment: 91.8, customers: 29_700, risk: "Watch" },
  { country: "Botswana", region: "Southern Africa", stores: 5, orders: 8_960, revenueUsd: 412_000, growth: 7.9, fulfilment: 95.6, customers: 24_900, risk: "Low" },
  { country: "Ghana", region: "West Africa", stores: 8, orders: 16_880, revenueUsd: 748_000, growth: 18.2, fulfilment: 90.7, customers: 48_300, risk: "Action" },
] as const;

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CeoDashboard() {
  const [period, setPeriod] = useState<keyof typeof periods>("This month");
  const [selectedRegion, setSelectedRegion] = useState("All Africa");
  const [notice, setNotice] = useState("");
  const multiplier: number = periods[period];
  const markets: ReadonlyArray<(typeof africaMarkets)[number]> = selectedRegion === "All Africa"
    ? africaMarkets
    : africaMarkets.filter((market) => market.region === selectedRegion);

  const totals = useMemo(() => {
    const revenue = markets.reduce((sum, market) => sum + market.revenueUsd, 0) * multiplier;
    const orders = markets.reduce((sum, market) => sum + market.orders, 0) * multiplier;
    const stores = markets.reduce((sum, market) => sum + market.stores, 0);
    const customers = markets.reduce((sum, market) => sum + market.customers, 0);
    const fulfilment = markets.reduce((sum, market) => sum + market.fulfilment, 0) / markets.length;
    return { revenue, orders, stores, customers, fulfilment };
  }, [markets, multiplier]);

  const topMarket = [...markets].sort((a, b) => b.revenueUsd - a.revenueUsd)[0];
  const fastestMarket = [...markets].sort((a, b) => b.growth - a.growth)[0];
  const regions = Array.from(new Set(africaMarkets.map((market) => market.region)));

  function exportBoardPack() {
    setNotice(`${period} board pack prepared for ${selectedRegion}.`);
  }

  return (
    <DashboardShell role="ceo">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-black text-[#3867d6]">
            <Globe2 className="h-4 w-4" /> Africa-wide executive access
          </p>
          <h2 className="mt-2 text-2xl font-black">Simba Africa command center</h2>
          <p className="mt-2 text-sm text-gray-500">Consolidated demo performance across country markets, stores, customers, fulfilment, and strategic risk.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={selectedRegion} onChange={(event) => setSelectedRegion(event.target.value)} className="h-10 rounded-md border border-black/10 bg-transparent px-3 text-xs font-bold dark:border-white/10">
            <option>All Africa</option>
            {regions.map((region) => <option key={region}>{region}</option>)}
          </select>
          {Object.keys(periods).map((item) => (
            <button key={item} onClick={() => setPeriod(item as keyof typeof periods)} className={`h-10 rounded-md px-3 text-xs font-black ${period === item ? "bg-[#3867d6] text-white" : "border border-black/10 dark:border-white/10"}`}>
              {item}
            </button>
          ))}
          <button onClick={exportBoardPack} className="button-primary !min-h-10 !bg-[#3867d6]">
            <Download className="h-4 w-4" /> Board pack
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-[#3867d6]/25 bg-[#3867d6]/10 p-4 text-xs font-bold text-[#284fae]">
          <CheckCircle2 className="h-4 w-4" /> {notice}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={TrendingUp} label={`Consolidated revenue - ${period.toLowerCase()}`} value={formatUsd(Math.round(totals.revenue))} trend="+12.8% group growth" />
        <StatCard icon={ShoppingCart} label="Customer orders" value={Math.round(totals.orders).toLocaleString()} trend={`${formatUsd(Math.round(totals.revenue / totals.orders))} average`} />
        <StatCard icon={Building2} label="Operating stores" value={String(totals.stores)} trend={`${markets.length} country markets`} />
        <StatCard icon={Users} label="Active customers" value={totals.customers.toLocaleString()} trend="+7.3% retention" />
        <StatCard icon={Truck} label="Group fulfilment" value={`${totals.fulfilment.toFixed(1)}%`} trend="Delivery network" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
        <section className="dashboard-card overflow-x-auto">
          <div className="flex items-center justify-between">
            <div><h3 className="font-black">Country market performance</h3><p className="mt-1 text-xs text-gray-500">Comparable operating view using consolidated demo metrics.</p></div>
            <Globe2 className="h-5 w-5 text-[#3867d6]" />
          </div>
          <table className="mt-5 w-full min-w-[850px] text-left text-xs">
            <thead className="border-b border-black/10 text-gray-400 dark:border-white/10">
              <tr>{["Market", "Region", "Stores", "Orders", "Revenue", "Growth", "Fulfilment", "Risk"].map((heading) => <th key={heading} className="py-3 font-bold">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr key={market.country} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-4 font-black">{market.country}</td>
                  <td className="text-gray-500">{market.region}</td>
                  <td>{market.stores}</td>
                  <td className="font-bold">{Math.round(market.orders * multiplier).toLocaleString()}</td>
                  <td className="font-bold">{formatUsd(Math.round(market.revenueUsd * multiplier))}</td>
                  <td className="font-black text-green-600">+{market.growth}%</td>
                  <td>{market.fulfilment}%</td>
                  <td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${market.risk === "Low" ? "bg-green-100 text-green-700" : market.risk === "Watch" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{market.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="dashboard-card">
          <h3 className="font-black">Executive reading</h3>
          <div className="mt-5 rounded-md bg-[#3867d6]/10 p-4">
            <p className="text-[10px] font-black uppercase text-[#3867d6]">Largest market</p>
            <p className="mt-2 text-sm font-black">{topMarket.country}</p>
            <p className="mt-1 text-xs text-gray-500">{formatUsd(Math.round(topMarket.revenueUsd * multiplier))} revenue</p>
          </div>
          <div className="mt-3 rounded-md bg-[#16865c]/10 p-4">
            <p className="text-[10px] font-black uppercase text-[#16865c]">Fastest growth</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-black">{fastestMarket.country} <ArrowUpRight className="h-4 w-4" /></p>
            <p className="mt-1 text-xs text-gray-500">+{fastestMarket.growth}% growth</p>
          </div>
          <div className="mt-3 rounded-md bg-[#f0b323]/15 p-4">
            <p className="text-[10px] font-black uppercase text-[#8a6200]">Strategic coverage</p>
            <p className="mt-2 text-2xl font-black">{markets.length}</p>
            <p className="mt-1 text-xs text-gray-500">Country markets in current view</p>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="dashboard-card">
          <div className="flex items-center justify-between"><h3 className="font-black">Regional contribution</h3><MapPin className="h-5 w-5 text-[#3867d6]" /></div>
          <div className="mt-5 space-y-5">
            {regions.map((region) => {
              const revenue = africaMarkets.filter((market) => market.region === region).reduce((sum, market) => sum + market.revenueUsd, 0);
              const share = Math.round((revenue / africaMarkets.reduce((sum, market) => sum + market.revenueUsd, 0)) * 100);
              return <div key={region}><div className="flex justify-between text-xs"><span className="font-bold">{region}</span><span>{share}% - {formatUsd(Math.round(revenue * multiplier))}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#3867d6]" style={{ width: `${share}%` }} /></div></div>;
            })}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="flex items-center justify-between"><h3 className="font-black">CEO attention queue</h3><ShieldCheck className="h-5 w-5 text-[#d94b1b]" /></div>
          <div className="mt-5 space-y-4">
            {[
              ["Ghana fulfilment", "90.7% service level requires recovery plan.", "Action"],
              ["Zambia store productivity", "Review sales per store against Southern Africa benchmark.", "Watch"],
              ["East Africa expansion", "Kenya and Tanzania growth support the next-site pipeline.", "Opportunity"],
            ].map(([title, detail, status]) => (
              <div key={title} className="flex gap-3 border-b border-black/5 pb-4 dark:border-white/5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${status === "Action" ? "bg-red-100 text-red-700" : status === "Watch" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                  {status === "Opportunity" ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </span>
                <div><p className="text-xs font-black">{title}</p><p className="mt-1 text-[11px] leading-5 text-gray-500">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
