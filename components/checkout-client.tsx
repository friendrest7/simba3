"use client";

import { useRouter } from "next/navigation";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches, formatPrice } from "@/lib/data";
import { useStore } from "./store-provider";
import { createClient } from "@/lib/supabase/client";

type PaymentMethod = "card" | "mobile" | "cash";
type FulfilmentMethod = "delivery" | "pickup";

export function CheckoutClient() {
  const { user, authLoading, cart, clearCart, currency, selectedBranchId, setSelectedBranchId, t } = useStore();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>("delivery");
  const [mobilePromptSent, setMobilePromptSent] = useState(false);
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = fulfilment === "pickup" || subtotal >= 40 ? 0 : 5.9;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!authLoading && !user) router.replace("/signin?next=/checkout");
  }, [user, authLoading, router]);

  function choosePayment(method: PaymentMethod) {
    setPaymentMethod(method);
    setMobilePromptSent(false);
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError("");
    if (paymentMethod === "mobile" && !mobilePromptSent) {
      setMobilePromptSent(true);
      return;
    }
    if (!user || !cart.length) return;

    const formData = new FormData(event.currentTarget);
    setPlacingOrder(true);
    try {
      const subtotalRwf = Math.round(subtotal * 1450);
      const deliveryFeeRwf = Math.round(deliveryFee * 1450);
      const { data: order, error: orderInsertError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          branch_id: selectedBranchId,
          status: "confirmed",
          subtotal_rwf: subtotalRwf,
          delivery_fee_rwf: deliveryFeeRwf,
          total_rwf: subtotalRwf + deliveryFeeRwf,
          payment_method: paymentMethod,
          delivery_address: fulfilment === "pickup" ? {
            fulfilment,
            branch: selectedBranch.name,
            address: selectedBranch.address,
          } : {
            fulfilment,
            address: formData.get("address"),
            city: formData.get("city"),
            landmark: formData.get("landmark"),
            instructions: formData.get("instructions"),
            phone: formData.get("phone"),
          },
        })
        .select("id, order_number")
        .single();
      if (orderInsertError) throw orderInsertError;

      const { error: itemsError } = await supabase.from("order_items").insert(cart.map(({ product, quantity }) => ({
        order_id: order.id,
        product_name: product.name,
        unit_price_rwf: Math.round(product.price * 1450),
        quantity,
      })));
      if (itemsError) throw itemsError;

      setOrderNumber(order.order_number);
      setPlaced(true);
      clearCart();
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Your order could not be saved. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (authLoading || !user) return <div className="min-h-[70vh] py-24 text-center text-sm text-muted">{t("protectedRoute")}</div>;

  if (placed) {
    const cashMessage = paymentMethod === "cash"
      ? fulfilment === "pickup" ? "Pay cash at the branch collection desk." : "Pay cash to the driver when your order arrives."
      : "Your payment has been recorded securely.";
    return (
      <div className="mx-auto min-h-[70vh] max-w-xl px-5 py-24 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[#16865c]" />
        <span className="eyebrow mt-7 inline-block">{t("orderConfirmed")}</span>
        <h1 className="mt-3 text-4xl font-black">Thank you, {user.name}.</h1>
        <p className="mt-4 leading-7 text-muted">
          Order #{orderNumber} is confirmed for {fulfilment === "pickup" ? `collection at ${selectedBranch.name}` : "delivery to your location"}. {cashMessage}
        </p>
        <button type="button" onClick={() => router.push("/dashboard/client")} className="button-primary mt-7">View your order</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
      <span className="eyebrow">Simple and secure checkout</span>
      <h1 className="mt-3 text-4xl font-black">{t("completeOrder")}</h1>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-muted">
        <span className="flex items-center gap-2 rounded-md bg-[#16865c]/10 px-3 py-2 text-[#16865c]"><ShieldCheck className="h-4 w-4" /> Signed in as {user.email}</span>
        <span className="flex items-center gap-2 rounded-md bg-[#3867d6]/10 px-3 py-2 text-[#3867d6]"><LockKeyhole className="h-4 w-4" /> Your details are protected</span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_370px]">
        <form onSubmit={placeOrder} className="space-y-8">
          <section className="rounded-xl border border-line p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase text-brand">Step 1</p>
            <h2 className="mt-2 text-lg font-black">Contact information</h2>
            <p className="mt-1 text-xs text-muted">We use these details for order confirmation and fulfilment updates.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><label className="form-label">Full name</label><input required name="name" className="form-input" placeholder="Full name" defaultValue={user.name} /></div>
              <div><label className="form-label">Email address</label><div className="relative"><Mail className="input-icon" /><input required name="email" type="email" className="form-input pl-11" placeholder="you@example.com" defaultValue={user.email} /></div></div>
              <div className="sm:col-span-2"><label className="form-label">Phone number</label><div className="relative"><Phone className="input-icon" /><input required name="phone" type="tel" className="form-input pl-11" placeholder="+250 78 123 4567" /></div></div>
            </div>
          </section>

          <section className="rounded-xl border border-line p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase text-brand">Step 2</p>
            <h2 className="mt-2 text-lg font-black">How do you want your order?</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setFulfilment("delivery")} className={`flex min-h-24 items-center gap-4 rounded-lg border p-4 text-left transition ${fulfilment === "delivery" ? "border-brand bg-brand/5 ring-2 ring-brand/10" : "border-line hover:border-brand/40"}`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand text-white"><Truck className="h-5 w-5" /></span>
                <span><b className="block text-sm">Deliver to me</b><small className="mt-1 block leading-5 text-muted">Simba delivers to your required location.</small></span>
              </button>
              <button type="button" onClick={() => setFulfilment("pickup")} className={`flex min-h-24 items-center gap-4 rounded-lg border p-4 text-left transition ${fulfilment === "pickup" ? "border-[#16865c] bg-[#16865c]/5 ring-2 ring-[#16865c]/10" : "border-line hover:border-[#16865c]/40"}`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#16865c] text-white"><Store className="h-5 w-5" /></span>
                <span><b className="block text-sm">Collect at Simba</b><small className="mt-1 block leading-5 text-muted">No delivery fee. We notify you when ready.</small></span>
              </button>
            </div>

            {fulfilment === "delivery" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="form-label">Delivery location or street address</label><div className="relative"><MapPin className="input-icon" /><input required name="address" className="form-input pl-11" placeholder="Example: KG 11 Avenue, house 24" /></div></div>
                <div><label className="form-label">City or district</label><input required name="city" className="form-input" placeholder="Kigali, Musanze, Huye..." /></div>
                <div><label className="form-label">Nearby landmark</label><input name="landmark" className="form-input" placeholder="Optional landmark" /></div>
                <div className="sm:col-span-2"><label className="form-label">Delivery instructions</label><textarea name="instructions" className="min-h-24 w-full rounded-md border border-line bg-transparent p-3 text-sm outline-none focus:border-brand" placeholder="Gate color, floor, reception, or best time to call." /></div>
              </div>
            ) : (
              <div className="mt-5">
                <label className="form-label">Choose collection branch</label>
                <select required value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="form-input">
                  {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>)}
                </select>
                <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#16865c]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-sm font-black">{selectedBranch.name}</p><p className="mt-1 text-xs text-muted">{selectedBranch.address}</p><p className="mt-1 text-xs text-muted">{selectedBranch.phone}</p></div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch.address)}`} target="_blank" rel="noopener noreferrer" className="button-secondary !min-h-10 shrink-0 !px-4"><ExternalLink className="h-4 w-4" /> Open map</a>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-line p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase text-brand">Step 3</p>
            <h2 className="mt-2 text-lg font-black">Choose payment method</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <button type="button" onClick={() => choosePayment("card")} className={`rounded-lg border p-4 text-left transition ${paymentMethod === "card" ? "border-[#3867d6] bg-[#3867d6]/10" : "border-line hover:border-[#3867d6]/50"}`}><CreditCard className="h-5 w-5 text-[#3867d6]" /><b className="mt-3 block text-sm">Bank card</b><small className="mt-1 block text-muted">Visa or Mastercard</small></button>
              <button type="button" onClick={() => choosePayment("mobile")} className={`rounded-lg border p-4 text-left transition ${paymentMethod === "mobile" ? "border-[#16865c] bg-[#16865c]/10" : "border-line hover:border-[#16865c]/50"}`}><Smartphone className="h-5 w-5 text-[#16865c]" /><b className="mt-3 block text-sm">Mobile money</b><small className="mt-1 block text-muted">Approve on your phone</small></button>
              <button type="button" onClick={() => choosePayment("cash")} className={`rounded-lg border p-4 text-left transition ${paymentMethod === "cash" ? "border-[#d97706] bg-[#d97706]/10" : "border-line hover:border-[#d97706]/50"}`}><Banknote className="h-5 w-5 text-[#d97706]" /><b className="mt-3 block text-sm">Cash</b><small className="mt-1 block text-muted">{fulfilment === "pickup" ? "Pay at collection" : "Pay the driver"}</small></button>
            </div>

            {paymentMethod === "card" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input required className="form-input sm:col-span-2" placeholder="Cardholder name" />
                <input required className="form-input sm:col-span-2" inputMode="numeric" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                <input required className="form-input" placeholder="MM / YY" defaultValue="12 / 29" />
                <input required className="form-input" placeholder="CVC" defaultValue="123" />
              </div>
            )}

            {paymentMethod === "mobile" && (
              <div className="mt-5 rounded-lg border border-[#16865c]/30 bg-[#16865c]/5 p-5">
                <label className="form-label text-[#16865c]">Phone number for payment approval</label>
                <div className="relative"><Phone className="input-icon" /><input required type="tel" className="form-input pl-11" placeholder="+250 78 123 4567" /></div>
                {mobilePromptSent && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#16865c]"><CheckCircle2 className="h-4 w-4" /> Request sent. Approve it on your phone, then confirm again.</p>}
              </div>
            )}

            {paymentMethod === "cash" && (
              <div className="mt-5 flex gap-3 rounded-lg border border-[#d97706]/30 bg-[#d97706]/10 p-4 text-sm text-[#85520a]">
                <Banknote className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{fulfilment === "pickup" ? `Bring FRw cash or pay at the ${selectedBranch.name} collection desk.` : "Have the exact amount ready where possible. Pay only after the driver presents your Simba order."}</p>
              </div>
            )}
          </section>

          {orderError && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{orderError}</p>}
          <button disabled={!cart.length || placingOrder} className={`button-primary w-full disabled:opacity-40 ${paymentMethod === "mobile" ? "!bg-[#16865c]" : paymentMethod === "cash" ? "!bg-[#d97706]" : "!bg-[#3867d6]"}`}>
            {paymentMethod === "cash" ? <Banknote className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
            {placingOrder
              ? "Saving your order..."
              : paymentMethod === "mobile" && !mobilePromptSent
              ? `Send payment request for ${formatPrice(total, currency)}`
              : paymentMethod === "cash"
                ? `Place cash order - ${formatPrice(total, currency)}`
                : `Confirm and pay ${formatPrice(total, currency)}`}
          </button>
        </form>

        <aside className="h-fit rounded-xl border border-line bg-canvas p-6 shadow-[0_14px_35px_rgba(0,0,0,.06)] lg:sticky lg:top-28">
          <h2 className="font-black">Your order</h2>
          <div className="mt-5 space-y-4">{cart.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 text-sm"><span className="text-muted">{quantity} &times; {product.name}</span><span className="font-bold">{formatPrice(product.price * quantity, currency)}</span></div>)}</div>
          <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(subtotal, currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted">{fulfilment === "pickup" ? "Branch collection" : "Delivery"}</span><span>{deliveryFee ? formatPrice(deliveryFee, currency) : "Free"}</span></div>
            <div className="flex justify-between pt-2 text-lg font-black"><span>Total</span><span>{formatPrice(total, currency)}</span></div>
          </div>
          <div className="mt-5 rounded-lg bg-black/[.035] p-4 text-xs leading-5 text-muted dark:bg-white/[.05]">
            <p className="font-black text-ink">{fulfilment === "pickup" ? "Collection order" : "Delivery order"}</p>
            <p className="mt-1">{fulfilment === "pickup" ? `${selectedBranch.name}, ${selectedBranch.address}` : "Your required address will be shared only with the assigned Simba branch and driver."}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
