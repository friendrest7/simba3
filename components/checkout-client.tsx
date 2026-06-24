"use client";

import { useRouter } from "next/navigation";
import {
  Banknote,
  Clock3,
  Loader2,
  LockKeyhole,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches } from "@/lib/data";
import { deliveryTimeSlots, getDeliveryQuote, kigaliDistricts } from "@/lib/delivery";
import { useStore } from "./store-provider";
import { OrderInvoice } from "./order-invoice";

type PaymentProvider = "mtn_momo" | "airtel_money" | "cash";
type FulfilmentMethod = "delivery" | "pickup";
type Address = {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  district: string;
  sector: string | null;
  street_address: string;
  landmark: string | null;
  instructions: string | null;
  is_default: boolean;
};
type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  paymentId?: string;
  providerReference?: string;
  paymentStatus: string;
  orderStatus: string;
  totalRwf: number;
  deliveryFeeRwf: number;
  estimatedDeliveryAt: string;
  demoPayment?: boolean;
  items: Array<{ name: string; quantity: number; price: number }>;
};

const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

export function CheckoutClient() {
  const { user, authLoading, cart, clearCart, selectedBranchId, setSelectedBranchId, t } = useStore();
  const router = useRouter();
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("mtn_momo");
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>("delivery");
  const [district, setDistrict] = useState("Nyarugenge");
  const [deliverySlot, setDeliverySlot] = useState(deliveryTimeSlots[0]);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentChecking, setPaymentChecking] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [error, setError] = useState("");
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const subtotalRwf = cart.reduce((sum, item) => sum + Math.round(item.product.price * 1450) * item.quantity, 0);
  const quote = getDeliveryQuote(district, fulfilment, subtotalRwf);
  const totalRwf = subtotalRwf + quote.feeRwf;
  const estimatedPreview = useMemo(
    () => new Intl.DateTimeFormat("en-RW", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(Date.now() + quote.estimatedHours * 3_600_000)),
    [quote.estimatedHours],
  );

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin?next=/checkout");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account/addresses")
      .then((response) => response.json())
      .then((data) => {
        const synced = Array.isArray(data.addresses) ? data.addresses as Address[] : [];
        const local = JSON.parse(window.localStorage.getItem(`simba-addresses-${user.id}`) || "[]") as Address[];
        const saved = synced.length ? synced : local;
        setAddresses(saved);
        const preferred = saved.find((item) => item.is_default) || saved[0];
        if (preferred) chooseSavedAddress(preferred);
      })
      .catch(() => {});
  }, [user]);

  function chooseSavedAddress(saved: Address) {
    setDistrict(saved.district);
    setPhone(saved.phone);
    setAddress(`${saved.street_address}${saved.sector ? `, ${saved.sector}` : ""}`);
    setLandmark(saved.landmark || "");
    setInstructions(saved.instructions || "");
  }

  async function pollPayment(checkout: CheckoutResult) {
    if (!checkout.paymentId) return;
    setPaymentChecking(true);
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 900 : 2_000));
      const response = await fetch(`/api/payments/${encodeURIComponent(checkout.paymentId)}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (data?.status === "successful") {
        setResult({ ...checkout, paymentStatus: "successful", orderStatus: "confirmed" });
        clearCart();
        setPaymentChecking(false);
        return;
      }
      if (data?.status === "failed") {
        setError("The mobile money payment was declined. No charge was completed.");
        setPaymentChecking(false);
        return;
      }
    }
    setError("Payment is still pending. Check your phone and view the order in your account for updates.");
    setPaymentChecking(false);
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (subtotalRwf < 2500) {
      return setError("Minimum order amount is 2,500 RWF. Please add more items to your basket.");
    }

    if (!/^\+2507[2389]\d{7}$/.test(phone)) {
      return setError("Please enter a valid Rwandan phone number (e.g., +250788123456).");
    }

    if (!cart.length) return;
    setPlacingOrder(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        fulfilment,
        branchId: selectedBranchId,
        district,
        address,
        landmark,
        instructions,
        deliverySlot,
        phone,
        paymentProvider,
      }),
    });
    const data = await response.json().catch(() => null);
    setPlacingOrder(false);
    if (!response.ok) return setError(data?.error || "Your order could not be placed.");
    setResult(data);
    if (paymentProvider === "cash") clearCart();
    else void pollPayment(data);
  }

  if (authLoading || !user) return <div className="min-h-[70vh] py-24 text-center text-sm text-muted">{t("protectedRoute")}</div>;

  if (result?.orderStatus === "confirmed") {
    return <OrderInvoice result={result} user={user!} />;
  }

  if (result && paymentChecking) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-lg px-4 py-24 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/10"><Loader2 className="h-8 w-8 animate-spin text-brand" /></span>
        <h1 className="mt-6 text-3xl font-black">Approve the payment on your phone</h1>
        <p className="mt-3 leading-7 text-muted">We are confirming {rwf.format(result.totalRwf)} for order {result.orderNumber}. Keep this page open.</p>
        {result.demoPayment && <p className="mt-4 rounded-md bg-amber-100 p-3 text-sm font-bold text-amber-800">Demo payment mode is active because provider credentials are not configured for this environment.</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <span className="eyebrow">Secure Rwanda checkout</span>
      <h1 className="mt-3 text-3xl font-black sm:text-4xl">{t("completeOrder")}</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="flex items-center gap-2 rounded-full bg-[#16865c]/10 px-3 py-2 text-[#16865c]"><ShieldCheck className="h-4 w-4" /> Authenticated checkout</span>
        <span className="flex items-center gap-2 rounded-full bg-brand/10 px-3 py-2 text-brand"><LockKeyhole className="h-4 w-4" /> Server-verified prices</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_370px]">
        <form onSubmit={placeOrder} className="space-y-6">
          <section className="rounded-xl border border-line p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase text-brand">1. Fulfilment</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setFulfilment("delivery")} className={`flex min-h-24 items-center gap-4 rounded-lg border p-4 text-left ${fulfilment === "delivery" ? "border-brand bg-brand/5" : "border-line"}`}><Truck className="h-6 w-6 text-brand" /><span><b className="block">Kigali delivery</b><small className="mt-1 block text-muted">Fee calculated by district</small></span></button>
              <button type="button" onClick={() => setFulfilment("pickup")} className={`flex min-h-24 items-center gap-4 rounded-lg border p-4 text-left ${fulfilment === "pickup" ? "border-brand bg-brand/5" : "border-line"}`}><Store className="h-6 w-6 text-brand" /><span><b className="block">Branch pickup</b><small className="mt-1 block text-muted">Free collection</small></span></button>
            </div>
            {fulfilment === "pickup" ? (
              <div className="mt-5"><label className="form-label">Collection branch</label><select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="form-input">{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>)}</select><p className="mt-2 text-xs text-muted">{selectedBranch.address}</p></div>
            ) : (
              <div className="mt-5 space-y-4">
                {addresses.length > 0 && <div><label className="form-label">Saved address</label><select defaultValue="" onChange={(event) => { const saved = addresses.find((item) => item.id === event.target.value); if (saved) chooseSavedAddress(saved); }} className="form-input"><option value="">Enter an address or choose saved</option>{addresses.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.street_address}, {item.district}</option>)}</select></div>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="form-label">Kigali district</label><select required value={district} onChange={(event) => setDistrict(event.target.value)} className="form-input">{kigaliDistricts.map((item) => <option key={item}>{item}</option>)}</select></div>
                  <div><label className="form-label">Preferred time</label><select required value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value as typeof deliverySlot)} className="form-input">{deliveryTimeSlots.map((slot) => <option key={slot}>{slot}</option>)}</select></div>
                  <div className="sm:col-span-2"><label className="form-label">Street, sector, or village</label><div className="relative"><MapPin className="input-icon" /><input required value={address} onChange={(event) => setAddress(event.target.value)} className="form-input pl-11" placeholder="KG 11 Ave, Kimihurura" /></div></div>
                  <div><label className="form-label">Nearby landmark</label><textarea value={landmark} onChange={(event) => setLandmark(event.target.value)} className="form-input" placeholder="Optional" rows={1} /></div>
                  <div><label className="form-label">Delivery instructions</label><textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} className="form-input" placeholder="Gate, floor, call on arrival..." rows={2} /></div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-line p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase text-brand">2. Payment</p>
            <h2 className="mt-2 text-lg font-black">Choose a payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setPaymentProvider("mtn_momo")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "mtn_momo" ? "border-[#f4c400] bg-[#f4c400]/10" : "border-line"}`}><Smartphone className="h-5 w-5 text-[#b89100]" /><b className="mt-3 block text-sm">MTN MoMo</b><small className="text-muted">Request to Pay</small></button>
              <button type="button" onClick={() => setPaymentProvider("airtel_money")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "airtel_money" ? "border-red-500 bg-red-500/10" : "border-line"}`}><Smartphone className="h-5 w-5 text-red-600" /><b className="mt-3 block text-sm">Airtel Money</b><small className="text-muted">Phone approval</small></button>
              <button type="button" onClick={() => setPaymentProvider("cash")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "cash" ? "border-[#16865c] bg-[#16865c]/10" : "border-line"}`}><Banknote className="h-5 w-5 text-[#16865c]" /><b className="mt-3 block text-sm">Cash</b><small className="text-muted">Pay on fulfilment</small></button>
            </div>
            <div><label className="form-label">Rwandan phone number</label><div className="relative"><Phone className="input-icon" /><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input pl-11" placeholder="+250788123456" /></div></div>
          </section>

          {error && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
          <button disabled={!cart.length || placingOrder} className="button-primary w-full disabled:opacity-50">{placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : paymentProvider === "cash" ? <Banknote className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{placingOrder ? "Creating secure order..." : paymentProvider === "cash" ? `Place order · ${rwf.format(totalRwf)}` : `Request ${paymentProvider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"} payment · ${rwf.format(totalRwf)}`}</button>
        </form>

        <aside className="h-fit rounded-xl border border-line bg-canvas p-5 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-black">Order summary</h2>
          <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">{cart.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 text-xs"><span className="text-muted">{quantity} × {product.name}</span><span className="shrink-0 font-bold">{rwf.format(Math.round(product.price * 1450) * quantity)}</span></div>)}</div>
          <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{rwf.format(subtotalRwf)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery · {quote.zone}</span><span>{quote.feeRwf ? rwf.format(quote.feeRwf) : "Free"}</span></div>
            <div className="flex justify-between text-lg font-black"><span>Total</span><span>{rwf.format(totalRwf)}</span></div>
          </div>
          <div className="mt-5 rounded-lg bg-brand/5 p-4 text-xs leading-5">
            <p className="flex items-center gap-2 font-black text-brand"><Clock3 className="h-4 w-4" /> Estimated fulfilment</p>
            <p className="mt-1 text-muted">{estimatedPreview}{fulfilment === "delivery" ? ` · ${deliverySlot}` : ""}</p>
          </div>
          {(landmark || instructions) && (
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-xs text-muted">
              {landmark && (
                <p><span className="font-bold text-ink">Landmark:</span> {landmark}</p>
              )}
              {instructions && (
                <p><span className="font-bold text-ink">Instructions:</span> {instructions}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
