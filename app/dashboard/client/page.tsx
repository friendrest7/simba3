"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Heart, Loader2, Package, RefreshCw, Repeat2, ShoppingBag, Truck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProductImage } from "@/components/product-image";
import { StatCard } from "@/components/stat-card";
import { useStore } from "@/components/store-provider";
import { allProducts } from "@/lib/catalog-products";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string;
  productCategory: string;
  unitPriceRwf: number;
  quantity: number;
};
type Order = {
  id: string;
  order_number: string;
  status: "pending" | "confirmed" | "packed" | "on_the_way" | "delivered" | "cancelled";
  total_rwf: number;
  payment_method: string | null;
  delivery_address: Record<string, unknown>;
  created_at: string;
  items: OrderItem[];
  events: Array<{ status: string; note: string | null; created_at: string }>;
};
type RecurringOrder = { id: string; source_order_id: string; frequency: string; next_delivery_date: string; active: boolean };

const steps = [
  ["pending", "Placed"],
  ["confirmed", "Confirmed"],
  ["packed", "Packed"],
  ["on_the_way", "Out for Delivery"],
  ["delivered", "Delivered"],
] as const;
const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

export default function ClientDashboard() {
  const { user, savedProductIds, addToCart } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [recurringOrders, setRecurringOrders] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");

  const loadOrders = useCallback(async () => {
    setError("");
    const response = await fetch("/api/orders", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (!response.ok) setError(data?.error || "Order history could not be loaded.");
    else {
      setOrders(data.orders || []);
      const localRecurring = user ? JSON.parse(window.localStorage.getItem(`simba-recurring-${user.id}`) || "[]") as RecurringOrder[] : [];
      setRecurringOrders(data.recurringOrders?.length ? data.recurringOrders : localRecurring);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`customer-orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, () => void loadOrders())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadOrders, user]);

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const recentlyPurchased = useMemo(() => {
    const seen = new Set<string>();
    return orders.flatMap((order) => order.items).filter((item) => {
      if (!item.productId || seen.has(item.productId)) return false;
      seen.add(item.productId);
      return true;
    }).slice(0, 6);
  }, [orders]);

  function buyAgain(order: Order) {
    let added = 0;
    for (const item of order.items) {
      const product = allProducts.find((candidate) => candidate.id === item.productId);
      if (!product) continue;
      addToCart(product, Math.min(product.stock, item.quantity));
      added += 1;
    }
    setNotice(added ? `${added} products from ${order.order_number} were added to your cart.` : "These older order items are no longer in the catalog.");
  }

  async function makeRecurring(order: Order) {
    const response = await fetch("/api/recurring-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, frequency }),
    });
    const data = await response.json().catch(() => null);
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + (frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30));
    const recurringOrder = response.ok ? data.recurringOrder : {
      id: crypto.randomUUID(),
      source_order_id: order.id,
      frequency,
      next_delivery_date: fallbackDate.toISOString().slice(0, 10),
      active: true,
    };
    setRecurringOrders((current) => {
      const next = [recurringOrder, ...current];
      if (user) window.localStorage.setItem(`simba-recurring-${user.id}`, JSON.stringify(next));
      return next;
    });
    setNotice(response.ok ? `${order.order_number} is now scheduled ${frequency}.` : `${order.order_number} is scheduled ${frequency} on this device. Apply the commerce migration for cross-device scheduling.`);
  }

  return <DashboardShell role="client">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h2 className="text-2xl font-black">Your Simba orders</h2><p className="mt-2 text-sm text-gray-500">History, live tracking, reorders, and scheduled deliveries.</p></div>
      <button type="button" onClick={() => void loadOrders()} className="button-secondary !min-h-11"><RefreshCw className="h-4 w-4" /> Refresh status</button>
    </div>

    {(notice || error) && <p role={error ? "alert" : "status"} className={`mt-5 rounded-md p-3 text-sm font-bold ${error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{error || notice}</p>}

    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <StatCard icon={ShoppingBag} label="Total orders" value={String(orders.length)} trend={orders.length ? "Full purchase history" : "Your first order is waiting"} />
      <StatCard icon={Truck} label="Active deliveries" value={String(activeOrders.length)} trend="Realtime status enabled" />
      <StatCard icon={Heart} label="Saved products" value={String(savedProductIds.length)} trend="Synced wishlist" />
    </div>

    {loading ? <div className="py-20 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" /><p className="mt-3 text-sm text-gray-500">Loading order history...</p></div> : orders.length ? (
      <div className="mt-8 space-y-5">
        {orders.map((order) => {
          const currentIndex = steps.findIndex(([status]) => status === order.status);
          const recurring = recurringOrders.find((item) => item.source_order_id === order.id && item.active);
          return <article key={order.id} className="dashboard-card rounded-xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase text-brand">{new Date(order.created_at).toLocaleDateString("en-RW", { dateStyle: "medium" })}</p><h3 className="mt-1 text-lg font-black">{order.order_number}</h3><p className="mt-1 text-xs text-gray-500">{order.items.length} products · {order.payment_method?.replaceAll("_", " ") || "payment pending"}</p></div>
              <div className="text-right"><span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-black capitalize text-brand">{order.status.replaceAll("_", " ")}</span><p className="mt-2 font-black">{rwf.format(Number(order.total_rwf))}</p></div>
            </div>

            {order.status !== "cancelled" && <div className="mt-7 grid grid-cols-5">{steps.map(([status, label], index) => {
              const complete = currentIndex >= index;
              return <div key={status} className="relative text-center"><span className={`relative z-10 mx-auto grid h-9 w-9 place-items-center rounded-full ${complete ? "bg-brand text-white" : "bg-gray-200 text-gray-400 dark:bg-white/10"}`}>{index < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : index === 3 ? <Truck className="h-4 w-4" /> : index === 4 ? <Package className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</span>{index < 4 && <span className={`absolute left-1/2 top-[17px] h-0.5 w-full ${currentIndex > index ? "bg-brand" : "bg-gray-200 dark:bg-white/10"}`} />}<span className="mt-2 block text-[9px] font-bold sm:text-[11px]">{label}</span></div>;
            })}</div>}

            <details className="mt-6 border-t border-line pt-4">
              <summary className="min-h-11 cursor-pointer py-3 text-sm font-black">View order details</summary>
              <div className="space-y-3 pt-2">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-line p-3"><div className="relative h-14 w-14 shrink-0 rounded-md bg-white"><ProductImage src={item.productImage} alt={item.productName} fill className="object-contain p-1" sizes="56px" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.productName}</p><p className="mt-1 text-xs text-gray-500">{item.quantity} × {rwf.format(item.unitPriceRwf)}</p></div></div>)}</div>
              {!!order.events.length && <div className="mt-4 space-y-2">{order.events.map((event) => <p key={`${event.status}-${event.created_at}`} className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString("en-RW")} · <b className="capitalize text-ink">{event.status.replaceAll("_", " ")}</b>{event.note ? ` · ${event.note}` : ""}</p>)}</div>}
            </details>

            <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
              <button type="button" onClick={() => buyAgain(order)} className="button-primary !min-h-11"><ShoppingBag className="h-4 w-4" /> Buy Again</button>
              <select value={frequency} onChange={(event) => setFrequency(event.target.value as typeof frequency)} className="form-input sm:max-w-40"><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option></select>
              <button type="button" disabled={Boolean(recurring)} onClick={() => void makeRecurring(order)} className="button-secondary !min-h-11 disabled:opacity-50"><Repeat2 className="h-4 w-4" /> {recurring ? `Next: ${new Date(recurring.next_delivery_date).toLocaleDateString()}` : "Make recurring"}</button>
            </div>
          </article>;
        })}
      </div>
    ) : (
      <div className="dashboard-card mt-8 rounded-xl py-16 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-gray-400" /><h3 className="mt-4 text-xl font-black">No orders yet</h3><p className="mt-2 text-sm text-gray-500">Products you purchase will appear here with live tracking.</p></div>
    )}

    {!!recentlyPurchased.length && <section className="dashboard-card mt-6 rounded-xl"><h3 className="font-black">Recently purchased</h3><p className="mt-1 text-xs text-gray-500">Quickly add individual favorites from previous orders.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recentlyPurchased.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-line p-3"><div className="relative h-12 w-12 shrink-0 bg-white"><ProductImage src={item.productImage} alt={item.productName} fill className="object-contain" sizes="48px" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{item.productName}</p><button type="button" onClick={() => { const product = allProducts.find((candidate) => candidate.id === item.productId); if (product) addToCart(product); }} className="mt-1 text-xs font-black text-brand">Add to cart</button></div></div>)}</div></section>}
  </DashboardShell>;
}
