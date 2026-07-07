"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, Building2, CheckCircle2, Download, Globe2, MapPin, Settings, ShieldCheck, ShoppingCart, TrendingUp, Truck, Users } from "lucide-react";
import { DashboardShell, useActiveTool } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { useStore } from "@/components/store-provider";

const periods = { "This month": 1, Quarter: 2.92, "Full year": 11.45 } as const;

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

function usd(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value); }

function CeoContent() {
  const activeTool = useActiveTool();
  const { t } = useStore();
  const [period, setPeriod] = useState<keyof typeof periods>("This month");
  const [selectedRegion, setSelectedRegion] = useState("All Africa");
  const [notice, setNotice] = useState("");
  const multiplier: number = periods[period];
  const markets = (selectedRegion === "All Africa" ? africaMarkets : africaMarkets.filter((m) => m.region === selectedRegion)) as typeof africaMarkets[number][];

  const totals = useMemo(() => {
    const revenue = markets.reduce((s, m) => s + m.revenueUsd, 0) * multiplier;
    const orders = markets.reduce((s, m) => s + m.orders, 0) * multiplier;
    const stores = markets.reduce((s, m) => s + m.stores, 0);
    const customers = markets.reduce((s, m) => s + m.customers, 0);
    const fulfilment = markets.reduce((s, m) => s + m.fulfilment, 0) / markets.length;
    return { revenue, orders, stores, customers, fulfilment };
  }, [markets, multiplier]);

  const regions = Array.from(new Set(africaMarkets.map((m) => m.region)));
  const topMarket = [...markets].sort((a, b) => b.revenueUsd - a.revenueUsd)[0];
  const fastestMarket = [...markets].sort((a, b) => b.growth - a.growth)[0];

  const periodButtons = <>
    <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="h-10 rounded-md border border-black/10 bg-transparent px-3 text-xs font-bold dark:border-white/10"><option>All Africa</option>{regions.map((r) => <option key={r}>{r}</option>)}</select>
    {Object.keys(periods).map((p) => <button key={p} onClick={() => setPeriod(p as keyof typeof periods)} className={`h-10 rounded-md px-3 text-xs font-black ${period === p ? "bg-[#3867d6] text-white" : "border border-black/10 dark:border-white/10"}`}>{p}</button>)}
  </>;

  const statsRow = <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
    <StatCard icon={TrendingUp} label={`Revenue - ${period.toLowerCase()}`} value={usd(Math.round(totals.revenue))} trend="+12.8% group growth" />
    <StatCard icon={ShoppingCart} label="Customer orders" value={Math.round(totals.orders).toLocaleString()} trend={`${usd(Math.round(totals.revenue / totals.orders))} avg`} />
    <StatCard icon={Building2} label="Operating stores" value={String(totals.stores)} trend={`${markets.length} country markets`} />
    <StatCard icon={Users} label="Active customers" value={totals.customers.toLocaleString()} trend="+7.3% retention" />
    <StatCard icon={Truck} label="Group fulfilment" value={`${totals.fulfilment.toFixed(1)}%`} trend="Delivery network" />
  </div>;

  const marketsTable = <section className="dashboard-card mt-6 overflow-x-auto rounded-xl">
    <div className="flex items-center justify-between"><div><h3 className="font-black">Country market performance</h3><p className="mt-1 text-xs text-gray-500">Consolidated demo metrics.</p></div><Globe2 className="h-5 w-5 text-[#3867d6]" /></div>
    <table className="mt-5 w-full min-w-[850px] text-left text-xs"><thead className="border-b border-black/10 text-gray-400 dark:border-white/10"><tr>{["Market", "Region", "Stores", "Orders", "Revenue", "Growth", "Fulfilment", "Risk"].map((h) => <th key={h} className="py-3 font-bold">{h}</th>)}</tr></thead><tbody>{markets.map((m) => <tr key={m.country} className="border-b border-black/5 dark:border-white/5"><td className="py-4 font-black">{m.country}</td><td className="text-gray-500">{m.region}</td><td>{m.stores}</td><td className="font-bold">{Math.round(m.orders * multiplier).toLocaleString()}</td><td className="font-bold">{usd(Math.round(m.revenueUsd * multiplier))}</td><td className="font-black text-green-600">+{m.growth}%</td><td>{m.fulfilment}%</td><td><span className={`rounded-full px-2 py-1 text-[10px] font-black ${m.risk === "Low" ? "bg-green-100 text-green-700" : m.risk === "Watch" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{m.risk}</span></td></tr>)}</tbody></table>
  </section>;

  const noticeBox = notice && <div className="mt-5 flex items-center gap-2 rounded-md border border-[#3867d6]/25 bg-[#3867d6]/10 p-4 text-xs font-bold text-[#284fae]"><CheckCircle2 className="h-4 w-4" /> {notice}</div>;

  if (activeTool === "Country markets") return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-black text-[#3867d6]"><Building2 className="h-4 w-4" /> Country markets</p><h2 className="mt-2 text-2xl font-black">Market performance</h2><p className="mt-2 text-sm text-gray-500">Revenue, orders, and risk by country.</p></div>
      <div className="flex flex-wrap gap-2">{periodButtons}</div>
    </div>
    {noticeBox}
    {statsRow}
    {marketsTable}
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="dashboard-card rounded-xl"><div className="flex items-center justify-between"><h3 className="font-black">Regional contribution</h3><MapPin className="h-5 w-5 text-[#3867d6]" /></div><div className="mt-5 space-y-5">{regions.map((region) => { const rev = africaMarkets.filter((m) => m.region === region).reduce((s, m) => s + m.revenueUsd, 0); const share = Math.round((rev / africaMarkets.reduce((s, m) => s + m.revenueUsd, 0)) * 100); return <div key={region}><div className="flex justify-between text-xs"><span className="font-bold">{region}</span><span>{share}% · {usd(Math.round(rev * multiplier))}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#3867d6]" style={{ width: `${share}%` }} /></div></div>; })}</div></section>
      <section className="dashboard-card rounded-xl"><h3 className="font-black">Executive reading</h3><div className="mt-5 rounded-md bg-[#3867d6]/10 p-4"><p className="text-[10px] font-black uppercase text-[#3867d6]">Largest market</p><p className="mt-2 text-sm font-black">{topMarket.country}</p><p className="mt-1 text-xs text-gray-500">{usd(Math.round(topMarket.revenueUsd * multiplier))} revenue</p></div><div className="mt-3 rounded-md bg-[#16865c]/10 p-4"><p className="text-[10px] font-black uppercase text-[#16865c]">Fastest growth</p><p className="mt-2 flex items-center gap-2 text-sm font-black">{fastestMarket.country} <ArrowUpRight className="h-4 w-4" /></p><p className="mt-1 text-xs text-gray-500">+{fastestMarket.growth}% growth</p></div></section>
    </div>
  </>;

  if (activeTool === "Growth") return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-black text-[#3867d6]"><TrendingUp className="h-4 w-4" /> Growth</p><h2 className="mt-2 text-2xl font-black">Group growth analytics</h2></div>
      <div className="flex flex-wrap gap-2">{periodButtons}</div>
    </div>
    {noticeBox}
    {statsRow}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{markets.map((m) => <div key={m.country} className="dashboard-card rounded-xl"><p className="text-xs font-black">{m.country}</p><p className="mt-3 text-2xl font-black text-green-600">+{m.growth}%</p><p className="mt-1 text-[10px] text-gray-500">{usd(Math.round(m.revenueUsd * multiplier))} revenue</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#3867d6]" style={{ width: `${Math.min(100, m.growth * 4)}%` }} /></div></div>)}</div>
  </>;

  if (activeTool === "Risk") return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-black text-[#d94b1b]"><ShieldCheck className="h-4 w-4" /> Risk</p><h2 className="mt-2 text-2xl font-black">Risk & attention queue</h2></div>
      <div className="flex flex-wrap gap-2">{periodButtons}</div>
    </div>
    {noticeBox}
    <div className="mt-8 grid gap-4 md:grid-cols-3">{markets.map((m) => <div key={m.country} className={`dashboard-card rounded-xl border-l-4 ${m.risk === "Action" ? "border-red-500" : m.risk === "Watch" ? "border-amber-400" : "border-green-500"}`}><div className="flex items-center justify-between"><span className="font-black">{m.country}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black ${m.risk === "Action" ? "bg-red-100 text-red-700" : m.risk === "Watch" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{m.risk}</span></div><p className="mt-2 text-xs text-gray-500">Fulfilment: {m.fulfilment}% · Growth: +{m.growth}%</p></div>)}</div>
    <section className="dashboard-card mt-6 rounded-xl"><div className="flex items-center gap-2 mb-5"><ShieldCheck className="h-5 w-5 text-[#d94b1b]" /><h3 className="font-black">CEO attention queue</h3></div>{[["Ghana fulfilment", "90.7% service level requires recovery plan.", "Action"], ["Zambia store productivity", "Review sales per store against Southern Africa benchmark.", "Watch"], ["East Africa expansion", "Kenya and Tanzania growth support the next-site pipeline.", "Opportunity"]].map(([title, detail, status]) => <div key={title} className="flex gap-3 border-b border-black/5 pb-4 dark:border-white/5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${status === "Action" ? "bg-red-100 text-red-700" : status === "Watch" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{status === "Opportunity" ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</span><div><p className="text-xs font-black">{title}</p><p className="mt-1 text-[11px] leading-5 text-gray-500">{detail}</p></div></div>)}</section>
  </>;

  if (activeTool === "Settings") return <div className="dashboard-card rounded-xl py-16 text-center"><Settings className="mx-auto h-10 w-10 text-gray-400" /><h2 className="mt-4 text-xl font-black">{t("executiveSettings")}</h2><p className="mt-2 text-sm text-gray-500">{t("executiveSettingsText")}</p></div>;

  // Africa overview (default)
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-black text-[#3867d6]"><Globe2 className="h-4 w-4" /> Africa-wide executive access</p><h2 className="mt-2 text-2xl font-black">Simba Africa command center</h2><p className="mt-2 text-sm text-gray-500">Consolidated demo performance across country markets, stores, customers, fulfilment, and strategic risk.</p></div>
      <div className="flex flex-wrap gap-2">{periodButtons}<button onClick={() => setNotice(`${period} board pack prepared for ${selectedRegion}.`)} className="button-primary !min-h-10 !bg-[#3867d6]"><Download className="h-4 w-4" /> Board pack</button></div>
    </div>
    {noticeBox}
    {statsRow}
    <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
      {marketsTable}
      <section className="dashboard-card rounded-xl"><h3 className="font-black">Executive reading</h3><div className="mt-5 rounded-md bg-[#3867d6]/10 p-4"><p className="text-[10px] font-black uppercase text-[#3867d6]">Largest market</p><p className="mt-2 text-sm font-black">{topMarket.country}</p><p className="mt-1 text-xs text-gray-500">{usd(Math.round(topMarket.revenueUsd * multiplier))} revenue</p></div><div className="mt-3 rounded-md bg-[#16865c]/10 p-4"><p className="text-[10px] font-black uppercase text-[#16865c]">Fastest growth</p><p className="mt-2 flex items-center gap-2 text-sm font-black">{fastestMarket.country} <ArrowUpRight className="h-4 w-4" /></p><p className="mt-1 text-xs text-gray-500">+{fastestMarket.growth}% growth</p></div><div className="mt-3 rounded-md bg-[#f0b323]/15 p-4"><p className="text-[10px] font-black uppercase text-[#8a6200]">Strategic coverage</p><p className="mt-2 text-2xl font-black">{markets.length}</p><p className="mt-1 text-xs text-gray-500">Country markets in current view</p></div></section>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="dashboard-card rounded-xl"><div className="flex items-center justify-between"><h3 className="font-black">Regional contribution</h3><MapPin className="h-5 w-5 text-[#3867d6]" /></div><div className="mt-5 space-y-5">{regions.map((region) => { const rev = africaMarkets.filter((m) => m.region === region).reduce((s, m) => s + m.revenueUsd, 0); const share = Math.round((rev / africaMarkets.reduce((s, m) => s + m.revenueUsd, 0)) * 100); return <div key={region}><div className="flex justify-between text-xs"><span className="font-bold">{region}</span><span>{share}% · {usd(Math.round(rev * multiplier))}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-[#3867d6]" style={{ width: `${share}%` }} /></div></div>; })}</div></section>
      <section className="dashboard-card rounded-xl"><div className="flex items-center justify-between"><h3 className="font-black">CEO attention queue</h3><ShieldCheck className="h-5 w-5 text-[#d94b1b]" /></div><div className="mt-5 space-y-4">{[["Ghana fulfilment", "90.7% service level requires recovery plan.", "Action"], ["Zambia store productivity", "Review sales per store against Southern Africa benchmark.", "Watch"], ["East Africa expansion", "Kenya and Tanzania growth support the next-site pipeline.", "Opportunity"]].map(([title, detail, status]) => <div key={title} className="flex gap-3 border-b border-black/5 pb-4 dark:border-white/5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${status === "Action" ? "bg-red-100 text-red-700" : status === "Watch" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{status === "Opportunity" ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</span><div><p className="text-xs font-black">{title}</p><p className="mt-1 text-[11px] leading-5 text-gray-500">{detail}</p></div></div>)}</div></section>
    </div>
  </>;
}

export default function CeoDashboard() {
  return <DashboardShell role="ceo"><CeoContent /></DashboardShell>;
}
