"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, Loader2, RefreshCw, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  total_rwf: number;
  payment_method: string | null;
  branch_id: string | null;
  created_at: string;
  customer: { full_name: string; email: string; phone: string };
  order_items: Array<{ product_name: string; quantity: number }>;
};
type Analytics = {
  revenueRwf: number;
  orderCount: number;
  averageOrderRwf: number;
  statusCounts: Record<string, number>;
  topProducts: Array<{ name: string; quantity: number; revenueRwf: number }>;
};

const statuses = ["pending", "confirmed", "packed", "on_the_way", "delivered", "cancelled"];
const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ revenueRwf: 0, orderCount: 0, averageOrderRwf: 0, statusCounts: {}, topProducts: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) setError(data?.error || "Admin analytics could not be loaded.");
    else {
      setOrders(data.orders || []);
      setAnalytics(data.analytics);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const data = await response.json().catch(() => null);
    setUpdating("");
    if (!response.ok) return setError(data?.error || "Order status update failed.");
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    setAnalytics((current) => ({
      ...current,
      statusCounts: Object.fromEntries(statuses.map((item) => [item, orders.filter((order) => (order.id === orderId ? status : order.status) === item).length])),
    }));
  }

  const visibleOrders = useMemo(
    () => statusFilter === "all" ? orders : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter],
  );
  const maxTopQuantity = Math.max(1, ...analytics.topProducts.map((product) => product.quantity));

  return <DashboardShell role="admin">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black text-brand">Market Rep / Admin</p><h2 className="mt-2 text-2xl font-black">Commerce operations</h2><p className="mt-2 text-sm text-gray-500">Live orders, revenue, top products, fulfilment, and stock signals.</p></div>
      <button type="button" onClick={() => void load()} className="button-secondary !min-h-11"><RefreshCw className="h-4 w-4" /> Refresh data</button>
    </div>

    {error && <p role="alert" className="mt-5 rounded-md bg-red-100 p-3 text-sm font-bold text-red-700">{error}</p>}
    {loading ? <div className="py-24 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-brand" /><p className="mt-3 text-sm text-gray-500">Loading live admin data...</p></div> : <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={TrendingUp} label="Revenue" value={rwf.format(analytics.revenueRwf)} trend="Excludes cancelled orders" />
        <StatCard icon={ShoppingCart} label="Orders" value={String(analytics.orderCount)} trend={`${rwf.format(analytics.averageOrderRwf)} average`} />
        <StatCard icon={Truck} label="Active fulfilment" value={String((analytics.statusCounts.confirmed || 0) + (analytics.statusCounts.packed || 0) + (analytics.statusCounts.on_the_way || 0))} trend={`${analytics.statusCounts.delivered || 0} delivered`} />
        <StatCard icon={Boxes} label="Catalog" value="789" trend="11 categories · 98 subcategories" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="dashboard-card rounded-xl">
          <div className="flex items-center justify-between"><div><h3 className="font-black">Top-selling products</h3><p className="mt-1 text-xs text-gray-500">Ranked by purchased quantity.</p></div><BarChart3 className="h-5 w-5 text-brand" /></div>
          {analytics.topProducts.length ? <div className="mt-6 space-y-4">{analytics.topProducts.map((product) => <div key={product.name}><div className="flex justify-between gap-4 text-xs"><span className="truncate font-bold">{product.name}</span><span className="shrink-0">{product.quantity} sold · {rwf.format(product.revenueRwf)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(6, product.quantity / maxTopQuantity * 100)}%` }} /></div></div>)}</div> : <p className="mt-8 text-sm text-gray-500">Sales will appear after the first order.</p>}
        </section>
        <section className="dashboard-card rounded-xl">
          <h3 className="font-black">Order pipeline</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">{statuses.slice(0, 5).map((status) => <button type="button" key={status} onClick={() => setStatusFilter(status)} className="rounded-lg border border-line p-4 text-left transition hover:border-brand"><span className="text-2xl font-black">{analytics.statusCounts[status] || 0}</span><span className="mt-1 block text-[10px] font-black uppercase text-gray-500">{status.replaceAll("_", " ")}</span></button>)}</div>
        </section>
      </div>

      <section className="dashboard-card mt-6 overflow-x-auto rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">Order management</h3><p className="mt-1 text-xs text-gray-500">Status changes update the customer tracking timeline.</p></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-md border border-line bg-transparent px-3 text-xs font-bold"><option value="all">All orders</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div>
        {visibleOrders.length ? <table className="mt-5 w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-line text-gray-500"><tr>{["Order", "Customer", "Products", "Payment", "Total", "Created", "Status"].map((heading) => <th key={heading} className="py-3 font-black">{heading}</th>)}</tr></thead>
          <tbody>{visibleOrders.map((order) => <tr key={order.id} className="border-b border-line/70"><td className="py-4 font-black">{order.order_number}</td><td><span className="block font-bold">{order.customer.full_name}</span><span className="text-gray-500">{order.customer.email}</span></td><td>{order.order_items?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0}</td><td className="capitalize">{order.payment_method?.replaceAll("_", " ") || "Pending"}</td><td className="font-black">{rwf.format(Number(order.total_rwf))}</td><td>{new Date(order.created_at).toLocaleDateString("en-RW")}</td><td><select disabled={updating === order.id} value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)} className="h-10 min-w-36 rounded-md border border-line bg-transparent px-2 font-bold capitalize disabled:opacity-50">{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody>
        </table> : <div className="py-16 text-center text-sm text-gray-500">No orders match this status.</div>}
      </section>
    </>}
  </DashboardShell>;
}
