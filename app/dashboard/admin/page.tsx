"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Boxes, CheckCircle2, Loader2, Plus, RefreshCw, Settings, ShoppingCart, Store, TrendingUp, Truck, Users, X } from "lucide-react";
import { DashboardShell, useActiveTool } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { useStore } from "@/components/store-provider";

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

function OverviewSection({ orders, analytics, loading, error, updating, statusFilter, setStatusFilter, load, updateStatus, maxTopQuantity }: {
  orders: AdminOrder[]; analytics: Analytics; loading: boolean; error: string; updating: string;
  statusFilter: string; setStatusFilter: (s: string) => void;
  load: () => void; updateStatus: (id: string, status: string) => void; maxTopQuantity: number;
}) {
  const visibleOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-black text-brand">Market Rep / Admin</p><h2 className="mt-2 text-2xl font-black">Commerce operations</h2><p className="mt-2 text-sm text-gray-500">Live orders, revenue, top products, fulfilment, and stock signals.</p></div>
      <button type="button" onClick={load} className="button-secondary !min-h-11"><RefreshCw className="h-4 w-4" /> Refresh data</button>
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
          {analytics.topProducts.length ? <div className="mt-6 space-y-4">{analytics.topProducts.map((p) => <div key={p.name}><div className="flex justify-between gap-4 text-xs"><span className="truncate font-bold">{p.name}</span><span className="shrink-0">{p.quantity} sold · {rwf.format(p.revenueRwf)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(6, p.quantity / maxTopQuantity * 100)}%` }} /></div></div>)}</div> : <p className="mt-8 text-sm text-gray-500">Sales will appear after the first order.</p>}
        </section>
        <section className="dashboard-card rounded-xl">
          <h3 className="font-black">Order pipeline</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">{statuses.slice(0, 5).map((s) => <button type="button" key={s} onClick={() => setStatusFilter(s)} className="rounded-lg border border-line p-4 text-left transition hover:border-brand"><span className="text-2xl font-black">{analytics.statusCounts[s] || 0}</span><span className="mt-1 block text-[10px] font-black uppercase text-gray-500">{s.replaceAll("_", " ")}</span></button>)}</div>
        </section>
      </div>
      <section className="dashboard-card mt-6 overflow-x-auto rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">Order management</h3><p className="mt-1 text-xs text-gray-500">Status changes update the customer tracking timeline.</p></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-md border border-line bg-transparent px-3 text-xs font-bold"><option value="all">All orders</option>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></div>
        {visibleOrders.length ? <table className="mt-5 w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-line text-gray-500"><tr>{["Order", "Customer", "Products", "Payment", "Total", "Created", "Status"].map((h) => <th key={h} className="py-3 font-black">{h}</th>)}</tr></thead>
          <tbody>{visibleOrders.map((o) => <tr key={o.id} className="border-b border-line/70"><td className="py-4 font-black">{o.order_number}</td><td><span className="block font-bold">{o.customer.full_name}</span><span className="text-gray-500">{o.customer.email}</span></td><td>{o.order_items?.reduce((s, i) => s + Number(i.quantity), 0) || 0}</td><td className="capitalize">{o.payment_method?.replaceAll("_", " ") || "Pending"}</td><td className="font-black">{rwf.format(Number(o.total_rwf))}</td><td>{new Date(o.created_at).toLocaleDateString("en-RW")}</td><td><select disabled={updating === o.id} value={o.status} onChange={(e) => void updateStatus(o.id, e.target.value)} className="h-10 min-w-36 rounded-md border border-line bg-transparent px-2 font-bold capitalize disabled:opacity-50">{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody>
        </table> : <div className="py-16 text-center text-sm text-gray-500">No orders match this status.</div>}
      </section>
    </>}
  </>;
}

function ProductsSection() {
  const { managedProducts, addManagedProduct } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", category: "Groceries", priceRwf: "", stock: "", unit: "", description: "" });

  const categoryImages: Record<string, string> = {
    Groceries: "/images/product-rice.png", Bakery: "/images/product-bread.png",
    "Milk & Dairy": "/images/product-milk.png", Beverages: "/images/water.svg",
    Snacks: "/images/simba-chutney.png", Fruits: "/images/5.jpg", Vegetables: "/images/16.jpg",
  };

  function publish(e: React.FormEvent) {
    e.preventDefault();
    const priceRwf = Number(newProduct.priceRwf);
    const stock = Number(newProduct.stock);
    if (!newProduct.name.trim() || !newProduct.unit.trim() || !newProduct.description.trim() || priceRwf <= 0 || stock <= 0) {
      setNotice("Complete every field with a valid price and stock quantity.");
      return;
    }
    addManagedProduct({
      id: `admin-${Date.now()}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: priceRwf / 1450,
      image: categoryImages[newProduct.category] || "/images/product-rice.png",
      unit: newProduct.unit.trim(),
      rating: 5, reviews: 0,
      seller: "Simba Admin",
      location: "Rwanda",
      stock, badge: "New",
      description: newProduct.description.trim(),
      availability: "available",
      branchId: "admin",
      managerCreated: true,
    });
    setNewProduct({ name: "", category: "Groceries", priceRwf: "", stock: "", unit: "", description: "" });
    setFormOpen(false);
    setNotice("Product published to marketplace inventory.");
  }

  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-2xl font-black">Product management</h2><p className="mt-2 text-sm text-gray-500">Add products that appear in the store. Catalog has 789 items in 11 categories.</p></div>
      <button type="button" onClick={() => setFormOpen(true)} className="button-primary !min-h-11"><Plus className="h-4 w-4" /> Add product</button>
    </div>

    {notice && <div className="mt-5 flex items-center gap-2 rounded-md border border-brand/25 bg-brand/10 p-4 text-xs font-bold text-brand"><CheckCircle2 className="h-4 w-4" /> {notice}</div>}

    {formOpen && (
      <section className="dashboard-card mt-6 rounded-xl border-brand/30 bg-white shadow-[0_18px_45px_rgba(0,0,0,.08)] dark:bg-white/[.04]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase text-brand"><Store className="h-4 w-4" /> Publish to marketplace</p><h3 className="mt-2 text-xl font-black">Add a new product</h3><p className="mt-1 text-xs text-gray-500">The product will be immediately visible in the store.</p></div>
          <button type="button" onClick={() => setFormOpen(false)} className="icon-button" title="Close"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={publish} className="mt-6 grid gap-4 md:grid-cols-2">
          <div><label className="form-label">Product name</label><input required value={newProduct.name} onChange={(e) => setNewProduct((c) => ({ ...c, name: e.target.value }))} className="form-input" placeholder="Simba Fruit Basket" /></div>
          <div><label className="form-label">Category</label><select value={newProduct.category} onChange={(e) => setNewProduct((c) => ({ ...c, category: e.target.value }))} className="form-input">{["Groceries", "Bakery", "Milk & Dairy", "Beverages", "Snacks", "Fruits", "Vegetables"].map((cat) => <option key={cat}>{cat}</option>)}</select></div>
          <div><label className="form-label">Selling price (FRw)</label><input required min="1" type="number" inputMode="numeric" value={newProduct.priceRwf} onChange={(e) => setNewProduct((c) => ({ ...c, priceRwf: e.target.value }))} className="form-input" placeholder="4500" /></div>
          <div><label className="form-label">Available stock</label><input required min="1" type="number" inputMode="numeric" value={newProduct.stock} onChange={(e) => setNewProduct((c) => ({ ...c, stock: e.target.value }))} className="form-input" placeholder="60" /></div>
          <div><label className="form-label">Unit / package size</label><input required value={newProduct.unit} onChange={(e) => setNewProduct((c) => ({ ...c, unit: e.target.value }))} className="form-input" placeholder="1 kg pack" /></div>
          <div className="md:row-span-2"><label className="form-label">Customer description</label><textarea required value={newProduct.description} onChange={(e) => setNewProduct((c) => ({ ...c, description: e.target.value }))} className="min-h-28 w-full rounded-md border border-line bg-transparent p-3 text-sm outline-none focus:border-brand" placeholder="Describe the product." /></div>
          <div className="flex items-end"><button className="button-primary w-full"><Plus className="h-4 w-4" /> Publish product</button></div>
        </form>
      </section>
    )}

    {managedProducts.length > 0 ? (
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {managedProducts.map((p) => (
          <div key={p.id} className="dashboard-card rounded-xl">
            <p className="font-black">{p.name}</p>
            <p className="mt-1 text-xs text-gray-500">{p.category} · {p.unit}</p>
            <div className="mt-3 flex justify-between text-xs">
              <span className="font-black text-brand">FRw {Math.round(p.price * 1450).toLocaleString()}</span>
              <span>{p.stock} in stock</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="dashboard-card mt-6 rounded-xl py-16 text-center"><Boxes className="mx-auto h-10 w-10 text-gray-400" /><h3 className="mt-4 text-lg font-black">No products added yet</h3><p className="mt-2 text-sm text-gray-500">Click "Add product" to publish your first item to the store.</p></div>
    )}
  </>;
}

function UsersSection() {
  return (
    <div className="dashboard-card rounded-xl py-16 text-center">
      <Users className="mx-auto h-10 w-10 text-gray-400" />
      <h2 className="mt-4 text-xl font-black">User management</h2>
      <p className="mt-2 text-sm text-gray-500">Customer and staff accounts are managed via Supabase. User-level admin actions (suspend, role change) will be available here.</p>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="dashboard-card rounded-xl py-16 text-center">
      <Settings className="mx-auto h-10 w-10 text-gray-400" />
      <h2 className="mt-4 text-xl font-black">Admin settings</h2>
      <p className="mt-2 text-sm text-gray-500">Platform configuration, notification preferences, and store settings will appear here.</p>
    </div>
  );
}

function AdminContent() {
  const activeTool = useActiveTool();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ revenueRwf: 0, orderCount: 0, averageOrderRwf: 0, statusCounts: {}, topProducts: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) setError(data?.error || "Admin analytics could not be loaded.");
    else { setOrders(data.orders || []); setAnalytics(data.analytics); }
    setLoading(false);
  }, []);

  useEffect(() => { const t = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(t); }, [load]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) });
    const data = await res.json().catch(() => null);
    setUpdating("");
    if (!res.ok) return setError(data?.error || "Order status update failed.");
    setOrders((cur) => cur.map((o) => o.id === orderId ? { ...o, status } : o));
    setAnalytics((cur) => ({ ...cur, statusCounts: Object.fromEntries(statuses.map((s) => [s, orders.filter((o) => (o.id === orderId ? status : o.status) === s).length])) }));
  }

  const maxTopQuantity = Math.max(1, ...analytics.topProducts.map((p) => p.quantity));

  if (activeTool === "Users") return <UsersSection />;
  if (activeTool === "Products") return <ProductsSection />;
  if (activeTool === "Orders") return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-2xl font-black">Order management</h2><p className="mt-2 text-sm text-gray-500">Status changes update the customer tracking timeline.</p></div>
        <button type="button" onClick={load} className="button-secondary !min-h-11"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>
      {error && <p role="alert" className="mt-5 rounded-md bg-red-100 p-3 text-sm font-bold text-red-700">{error}</p>}
      {loading ? <div className="py-24 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-brand" /></div> : (
        <section className="dashboard-card mt-6 overflow-x-auto rounded-xl">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-md border border-line bg-transparent px-3 text-xs font-bold"><option value="all">All orders</option>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select>
          {(statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)).length ? (
            <table className="mt-5 w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-line text-gray-500"><tr>{["Order", "Customer", "Products", "Payment", "Total", "Created", "Status"].map((h) => <th key={h} className="py-3 font-black">{h}</th>)}</tr></thead>
              <tbody>{(statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)).map((o) => <tr key={o.id} className="border-b border-line/70"><td className="py-4 font-black">{o.order_number}</td><td><span className="block font-bold">{o.customer.full_name}</span><span className="text-gray-500">{o.customer.email}</span></td><td>{o.order_items?.reduce((s, i) => s + Number(i.quantity), 0) || 0}</td><td className="capitalize">{o.payment_method?.replaceAll("_", " ") || "Pending"}</td><td className="font-black">{rwf.format(Number(o.total_rwf))}</td><td>{new Date(o.created_at).toLocaleDateString("en-RW")}</td><td><select disabled={updating === o.id} value={o.status} onChange={(e) => void updateStatus(o.id, e.target.value)} className="h-10 min-w-36 rounded-md border border-line bg-transparent px-2 font-bold capitalize disabled:opacity-50">{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody>
            </table>
          ) : <div className="py-16 text-center text-sm text-gray-500">No orders match this status.</div>}
        </section>
      )}
    </>
  );
  if (activeTool === "Settings") return <SettingsSection />;

  // Overview (default)
  return <OverviewSection orders={orders} analytics={analytics} loading={loading} error={error} updating={updating} statusFilter={statusFilter} setStatusFilter={setStatusFilter} load={load} updateStatus={updateStatus} maxTopQuantity={maxTopQuantity} />;
}

export default function AdminDashboard() {
  return <DashboardShell role="admin"><AdminContent /></DashboardShell>;
}
