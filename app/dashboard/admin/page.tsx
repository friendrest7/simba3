"use client";

import { useState } from "react";
import { BarChart3, Boxes, Building2, CheckCircle2, Download, ShoppingCart, TrendingUp, Truck, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { branches, drivers, products } from "@/lib/data";

const periods = { Today: 1, "7 days": 6.72, "30 days": 28.4 } as const;

export default function AdminDashboard() {
  const [period, setPeriod] = useState<keyof typeof periods>("Today");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [notice, setNotice] = useState("");
  const multiplier = periods[period];
  const visibleBranches = selectedBranch === "all" ? branches : branches.filter((branch) => branch.id === selectedBranch);
  const totalOrders = visibleBranches.reduce((sum, branch) => sum + Math.round(branch.orders * multiplier), 0);
  const nationalSales = totalOrders * 23_750;
  const activeDrivers = drivers.filter((driver) => driver.status !== "offline").length;
  const averageOrder = 23_750;
  const branchRows = visibleBranches.map((branch, index) => {
    const orders = Math.round(branch.orders * multiplier);
    const sales = orders * averageOrder;
    const score = 91 + ((branch.orders + index) % 7);
    return { branch, orders, sales, score, drivers: drivers.filter((driver) => driver.branchId === branch.id).length };
  });
  const bestBranch = [...branchRows].sort((a, b) => b.sales - a.sales)[0];

  function exportReport() {
    setNotice(`${period} national report prepared for ${selectedBranch === "all" ? "all Rwanda branches" : bestBranch?.branch.name}.`);
  }

  return <DashboardShell role="admin">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black text-[#8b4bb5]">Head office · Rwanda network access</p><h2 className="mt-2 text-2xl font-black">General manager command center</h2><p className="mt-2 text-sm text-gray-500">Sales, branch execution, inventory risk, and delivery performance in one view.</p></div>
      <div className="flex flex-wrap gap-2">
        <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="h-10 rounded-md border border-black/10 bg-transparent px-3 text-xs font-bold dark:border-white/10"><option value="all">All Rwanda branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
        {Object.keys(periods).map((item) => <button key={item} onClick={() => setPeriod(item as keyof typeof periods)} className={`h-10 rounded-md px-3 text-xs font-black ${period === item ? "bg-[#8b4bb5] text-white" : "border border-black/10 dark:border-white/10"}`}>{item}</button>)}
        <button onClick={exportReport} className="button-primary !min-h-10 !bg-[#8b4bb5]"><Download className="h-4 w-4" /> Export report</button>
      </div>
    </div>

    {notice && <div className="mt-5 flex items-center gap-2 rounded-md border border-[#8b4bb5]/25 bg-[#8b4bb5]/10 p-4 text-xs font-bold text-[#6c368f]"><CheckCircle2 className="h-4 w-4" /> {notice}</div>}

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard icon={TrendingUp} label={`Sales · ${period.toLowerCase()}`} value={`FRw ${nationalSales.toLocaleString()}`} trend="+9.4% vs prior period" />
      <StatCard icon={ShoppingCart} label="Customer orders" value={totalOrders.toLocaleString()} trend={`FRw ${averageOrder.toLocaleString()} average`} />
      <StatCard icon={Building2} label="Reporting branches" value={String(visibleBranches.length)} trend={selectedBranch === "all" ? "All Rwanda locations" : "Focused view"} />
      <StatCard icon={Users} label="Branch managers" value={String(visibleBranches.length)} trend="100% assigned" />
      <StatCard icon={Truck} label="Active drivers" value={String(activeDrivers)} trend="Live reporting enabled" />
    </div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.55fr]">
      <section className="dashboard-card overflow-x-auto">
        <div className="flex items-center justify-between"><div><h3 className="font-black">Branch performance</h3><p className="mt-1 text-xs text-gray-500">Comparable operating results for the selected reporting period.</p></div><BarChart3 className="h-5 w-5 text-[#8b4bb5]" /></div>
        <table className="mt-5 w-full min-w-[820px] text-left text-xs">
          <thead className="border-b border-black/10 text-gray-400 dark:border-white/10"><tr>{["Branch", "Manager", "Orders", "Sales", "Drivers", "On time", "Performance"].map((heading) => <th key={heading} className="py-3 font-bold">{heading}</th>)}</tr></thead>
          <tbody>{branchRows.map(({ branch, orders, sales, score, drivers: driverCount }) => <tr key={branch.id} className="border-b border-black/5 dark:border-white/5"><td className="py-4 font-black">{branch.name}</td><td className="text-gray-500">{branch.manager}</td><td className="font-bold">{orders.toLocaleString()}</td><td className="font-bold">FRw {sales.toLocaleString()}</td><td>{driverCount}</td><td><span className="rounded-sm bg-green-100 px-2 py-1 font-bold text-green-700">{score}%</span></td><td><div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-[#8b4bb5]" style={{ width: `${Math.min(100, Math.round((sales / (bestBranch?.sales || sales)) * 100))}%` }} /></div></td></tr>)}</tbody>
        </table>
      </section>

      <section className="dashboard-card">
        <h3 className="font-black">Executive reading</h3>
        <div className="mt-5 rounded-md bg-[#16865c]/10 p-4"><p className="text-[10px] font-black uppercase text-[#16865c]">Top branch</p><p className="mt-2 text-sm font-black">{bestBranch?.branch.name}</p><p className="mt-1 text-xs text-gray-500">FRw {bestBranch?.sales.toLocaleString()} sales</p></div>
        <div className="mt-3 rounded-md bg-[#3867d6]/10 p-4"><p className="text-[10px] font-black uppercase text-[#3867d6]">Network fulfilment</p><p className="mt-2 text-2xl font-black">94.2%</p><p className="mt-1 text-xs text-gray-500">Orders delivered complete</p></div>
        <div className="mt-3 rounded-md bg-[#f0b323]/15 p-4"><p className="text-[10px] font-black uppercase text-[#9a6900]">Projected close</p><p className="mt-2 text-sm font-black">FRw {Math.round(nationalSales * 1.086).toLocaleString()}</p><p className="mt-1 text-xs text-gray-500">At current trading pace</p></div>
      </section>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <section className="dashboard-card">
        <div className="flex items-center justify-between"><h3 className="font-black">Category contribution</h3><span className="text-[10px] font-black text-[#16865c]">FRw {nationalSales.toLocaleString()} total</span></div>
        <div className="mt-5 space-y-4">{[
          ["Groceries & pantry", 31, "#d94b1b"], ["Milk & dairy", 22, "#3867d6"], ["Fresh produce", 19, "#16865c"], ["Snacks", 16, "#f0b323"], ["Bakery & other", 12, "#8b4bb5"],
        ].map(([label, share, color]) => <div key={String(label)}><div className="flex justify-between text-xs"><span className="font-bold">{label}</span><span>FRw {Math.round(nationalSales * Number(share) / 100).toLocaleString()} · {share}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: String(color) }} /></div></div>)}</div>
      </section>
      <section className="dashboard-card">
        <div className="flex items-center justify-between"><h3 className="font-black">Inventory risks requiring action</h3><Boxes className="h-5 w-5 text-[#d94b1b]" /></div>
        <div className="mt-5 space-y-4">{products.slice(0, 6).map((product, index) => <div key={product.id} className="flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5"><div><p className="text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">{2 + (index % 4)} branches below 7-day cover</p></div><button onClick={() => setNotice(`National replenishment review opened for ${product.name}.`)} className="text-[10px] font-black text-[#d94b1b]">Review</button></div>)}</div>
      </section>
    </div>
  </DashboardShell>;
}
