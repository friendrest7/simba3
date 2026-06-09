"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, CheckCircle2, CircleDollarSign, FileCheck2, MapPin, PackageCheck, Plus, Send, Store, Truck, X } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { DeliveryMap } from "@/components/delivery-map";
import { StatCard } from "@/components/stat-card";
import { useStore } from "@/components/store-provider";
import { branches, drivers, getBranchStock, products } from "@/lib/data";

const periods = { Today: 1, "This week": 6.72, "This month": 28.4 } as const;

export default function ManagerDashboard() {
  const { user, managedProducts, addManagedProduct } = useStore();
  const branch = branches.find((item) => item.id === user?.branchId) || branches[0];
  const branchDrivers = drivers.filter((driver) => driver.branchId === branch.id);
  const [period, setPeriod] = useState<keyof typeof periods>("Today");
  const [notice, setNotice] = useState("");
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", category: "Groceries", priceRwf: "", stock: "", unit: "", description: "" });
  const multiplier = periods[period];
  const orders = Math.round(branch.orders * multiplier);
  const sales = orders * 23_750;
  const packed = Math.round(orders * 0.73);
  const awaitingPacking = Math.max(0, orders - packed);
  const deliveryRate = 91 + (branch.orders % 6);

  const inventory = useMemo(() => products.slice(0, 8).map((product) => ({
    ...product,
    branchStock: stockOverrides[product.id] ?? getBranchStock(product, branch.id),
  })), [branch.id, stockOverrides]);
  const lowStock = inventory.filter((product) => product.branchStock < 25).length;

  function replenish(productId: string) {
    setStockOverrides((current) => ({ ...current, [productId]: (current[productId] ?? inventory.find((item) => item.id === productId)?.branchStock ?? 0) + 40 }));
    setNotice("Replenishment request recorded and inventory forecast updated.");
  }

  function submitReport() {
    window.localStorage.setItem(`simba-manager-report-${branch.id}`, new Date().toISOString());
    setNotice(`${period} operations report submitted to Simba head office.`);
  }

  function publishProduct(event: React.FormEvent) {
    event.preventDefault();
    const priceRwf = Number(newProduct.priceRwf);
    const stock = Number(newProduct.stock);
    if (!newProduct.name.trim() || !newProduct.unit.trim() || !newProduct.description.trim() || priceRwf <= 0 || stock <= 0) {
      setNotice("Complete every product field with a valid price and stock quantity.");
      return;
    }
    const categoryImages: Record<string, string> = {
      Groceries: "/images/product-rice.png",
      Bakery: "/images/product-bread.png",
      "Milk & Dairy": "/images/product-milk.png",
      Beverages: "/images/water.svg",
      Snacks: "/images/simba-chutney.png",
      Fruits: "/images/5.jpg",
      Vegetables: "/images/16.jpg",
    };
    addManagedProduct({
      id: `branch-${branch.id}-${Date.now()}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: priceRwf / 1450,
      image: categoryImages[newProduct.category] || "/images/product-rice.png",
      unit: newProduct.unit.trim(),
      rating: 5,
      reviews: 0,
      seller: branch.name,
      location: `${branch.city}, Rwanda`,
      stock,
      badge: "New at branch",
      description: newProduct.description.trim(),
      availability: "available",
      branchId: branch.id,
      managerCreated: true,
    });
    setNewProduct({ name: "", category: "Groceries", priceRwf: "", stock: "", unit: "", description: "" });
    setProductFormOpen(false);
    setNotice(`Product published successfully to ${branch.name} marketplace inventory.`);
  }

  return <DashboardShell role="manager">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-black text-[#16865c]"><MapPin className="h-4 w-4" /> Restricted to {branch.name}</p><h2 className="mt-2 text-2xl font-black">Branch operations center</h2><p className="mt-2 text-sm text-gray-500">{branch.address} &middot; {branch.phone}</p></div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(periods).map((item) => <button key={item} onClick={() => setPeriod(item as keyof typeof periods)} className={`h-10 rounded-md px-4 text-xs font-black ${period === item ? "bg-[#16865c] text-white" : "border border-black/10 dark:border-white/10"}`}>{item}</button>)}
        <button type="button" onClick={() => setProductFormOpen(true)} className="button-primary !min-h-10"><Plus className="h-4 w-4" /> Add finished product</button>
        <button onClick={submitReport} className="button-secondary !min-h-10 !border-[#3867d6] !text-[#3867d6]"><Send className="h-4 w-4" /> Submit report</button>
      </div>
    </div>

    {notice && <div className="mt-5 flex items-center gap-2 rounded-md border border-[#16865c]/25 bg-[#16865c]/10 p-4 text-xs font-bold text-[#116344]"><CheckCircle2 className="h-4 w-4" /> {notice}</div>}

    {productFormOpen && (
      <section className="dashboard-card mt-6 border-brand/30 bg-white shadow-[0_18px_45px_rgba(0,0,0,.08)] dark:bg-white/[.04]">
        <div className="flex items-start justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-black uppercase text-brand"><Store className="h-4 w-4" /> Publish to marketplace</p><h3 className="mt-2 text-xl font-black">Add a finished product</h3><p className="mt-1 text-xs text-gray-500">This product will be available only from {branch.name} until another branch adds its own stock.</p></div>
          <button type="button" onClick={() => setProductFormOpen(false)} className="icon-button" title="Close product form"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={publishProduct} className="mt-6 grid gap-4 md:grid-cols-2">
          <div><label className="form-label">Product name</label><input required value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} className="form-input" placeholder="Example: Simba Branch Fruit Basket" /></div>
          <div><label className="form-label">Category</label><select value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))} className="form-input">{["Groceries", "Bakery", "Milk & Dairy", "Beverages", "Snacks", "Fruits", "Vegetables"].map((category) => <option key={category}>{category}</option>)}</select></div>
          <div><label className="form-label">Selling price (FRw)</label><input required min="1" inputMode="numeric" type="number" value={newProduct.priceRwf} onChange={(event) => setNewProduct((current) => ({ ...current, priceRwf: event.target.value }))} className="form-input" placeholder="4500" /></div>
          <div><label className="form-label">Available stock</label><input required min="1" inputMode="numeric" type="number" value={newProduct.stock} onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))} className="form-input" placeholder="60" /></div>
          <div><label className="form-label">Unit or package size</label><input required value={newProduct.unit} onChange={(event) => setNewProduct((current) => ({ ...current, unit: event.target.value }))} className="form-input" placeholder="1 kg pack" /></div>
          <div className="md:row-span-2"><label className="form-label">Customer description</label><textarea required value={newProduct.description} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} className="min-h-28 w-full rounded-md border border-line bg-transparent p-3 text-sm outline-none focus:border-brand" placeholder="Describe quality, contents, and ideal use." /></div>
          <div className="flex items-end"><button className="button-primary w-full"><Plus className="h-4 w-4" /> Publish product</button></div>
        </form>
      </section>
    )}

    {!!managedProducts.filter((product) => product.branchId === branch.id).length && <section className="dashboard-card mt-6"><div className="flex items-center justify-between"><div><h3 className="font-black">Branch-published products</h3><p className="mt-1 text-xs text-gray-500">Live products added by this branch management account.</p></div><span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand">{managedProducts.filter((product) => product.branchId === branch.id).length} live</span></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{managedProducts.filter((product) => product.branchId === branch.id).map((product) => <div key={product.id} className="rounded-md border border-line p-4"><p className="text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-gray-500">{product.category} &middot; {product.unit}</p><div className="mt-3 flex justify-between text-xs"><span className="font-black text-brand">FRw {Math.round(product.price * 1450).toLocaleString()}</span><span>{product.stock} in stock</span></div></div>)}</div></section>}

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={CircleDollarSign} label={`Sales · ${period.toLowerCase()}`} value={`FRw ${sales.toLocaleString()}`} trend="+8.6% vs prior period" />
      <StatCard icon={PackageCheck} label="Orders received" value={orders.toLocaleString()} trend={`${awaitingPacking} awaiting packing`} />
      <StatCard icon={Truck} label="On-time delivery" value={`${deliveryRate}%`} trend={`${branchDrivers.filter((driver) => driver.status !== "offline").length} drivers active`} />
      <StatCard icon={AlertTriangle} label="Low stock items" value={String(lowStock)} trend={lowStock ? "Replenishment needed" : "Inventory healthy"} />
    </div>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="dashboard-card overflow-x-auto">
        <div className="flex items-center justify-between"><div><h3 className="font-black">Live branch inventory</h3><p className="mt-1 text-xs text-gray-500">Stock calculated for {branch.name}, not national warehouse totals.</p></div><Boxes className="h-5 w-5 text-brand" /></div>
        <table className="mt-5 w-full min-w-[650px] text-left text-xs">
          <thead className="border-b border-black/10 text-gray-400 dark:border-white/10"><tr>{["Product", "Category", "Branch stock", "Cover", "Action"].map((heading) => <th key={heading} className="py-3">{heading}</th>)}</tr></thead>
          <tbody>{inventory.map((product) => {
            const cover = Math.max(1, Math.round(product.branchStock / 7));
            return <tr key={product.id} className="border-b border-black/5 dark:border-white/5"><td className="py-4 font-black">{product.name}</td><td className="text-gray-500">{product.category}</td><td className="font-bold">{product.branchStock} units</td><td><span className={`rounded-sm px-2 py-1 text-[10px] font-bold ${product.branchStock < 25 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{cover} days</span></td><td><button onClick={() => replenish(product.id)} className="font-bold text-brand">Replenish +40</button></td></tr>;
          })}</tbody>
        </table>
      </section>

      <section className="dashboard-card">
        <div className="flex items-center justify-between"><h3 className="font-black">Driver readiness</h3><span className="text-[10px] font-black text-[#16865c]">{branchDrivers.filter((driver) => driver.status !== "offline").length} online</span></div>
        <div className="mt-5 space-y-4">{branchDrivers.length ? branchDrivers.map((driver) => <div key={driver.id} className="border-b border-black/5 pb-4 dark:border-white/5"><div className="flex items-center justify-between"><div><p className="text-xs font-black">{driver.name}</p><p className="mt-1 text-[10px] text-gray-500">{driver.vehicle} &middot; {driver.registration}</p></div><span className={`rounded-sm px-2 py-1 text-[10px] font-bold ${driver.status === "delivering" ? "bg-blue-100 text-blue-700" : driver.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{driver.status}</span></div><div className="mt-3 flex justify-between text-[10px] text-gray-500"><span>Customer rating</span><b className="text-ink">{driver.rating}/5.0</b></div></div>) : <p className="text-sm text-gray-500">No drivers assigned to this branch.</p>}</div>
      </section>
    </div>

    <div className="mt-6"><DeliveryMap compact branchId={branch.id} driverId={branchDrivers[0]?.id} /></div>
    <section className="dashboard-card mt-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-[#3867d6]/10 text-[#3867d6]"><FileCheck2 className="h-5 w-5" /></span><div><h3 className="text-sm font-black">Operational interpretation</h3><p className="mt-1 text-xs text-gray-500">{packed.toLocaleString()} of {orders.toLocaleString()} orders are packed. At the current pace, the branch is projected to close {period.toLowerCase()} at FRw {sales.toLocaleString()} in sales with {deliveryRate}% on-time delivery.</p></div></div></section>
  </DashboardShell>;
}
