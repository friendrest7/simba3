"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Clock3,
  Loader2,
  LockKeyhole,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { branches } from "@/lib/data";
import { deliveryTimeSlots, distanceBasedFee, distanceEstimatedHours, haversineKm } from "@/lib/delivery";
import { useStore } from "./store-provider";
import { OrderInvoice } from "./order-invoice";
import { SimbaQrPanel } from "./simba-qr-panel";

type PaymentProvider = "mtn_momo" | "airtel_money" | "cash" | "qr_code";
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
  qrPayment?: boolean;
  items: Array<{ name: string; quantity: number; price: number }>;
};

const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });

export function CheckoutClient() {
  const { user, authLoading, cart, clearCart, selectedBranchId, setSelectedBranchId, t } = useStore();
  const router = useRouter();
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("mtn_momo");
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>("delivery");
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
  // Distance-based delivery
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [clientCoords, setClientCoords] = useState<{ lat: number; lng: number } | null>(null);
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const subtotalRwf = cart.reduce((sum, item) => sum + Math.round(item.product.price * 1450) * item.quantity, 0);

  const distanceKm = useMemo(() => {
    if (!clientCoords || fulfilment === "pickup") return null;
    return haversineKm(clientCoords.lat, clientCoords.lng, selectedBranch.coordinates.lat, selectedBranch.coordinates.lng);
  }, [clientCoords, selectedBranch, fulfilment]);

  const feeRwf = fulfilment === "pickup" ? 0 : distanceKm != null ? distanceBasedFee(distanceKm, subtotalRwf) : null;
  const estimatedHours = fulfilment === "pickup" ? 2 : distanceKm != null ? distanceEstimatedHours(distanceKm) : 5;
  const totalRwf = subtotalRwf + (feeRwf ?? 0);
  const estimatedPreview = useMemo(
    () => new Intl.DateTimeFormat("en-RW", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(Date.now() + estimatedHours * 3_600_000)),
    [estimatedHours],
  );

  async function detectLocation() {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setClientCoords({ lat, lng });
        setGeoStatus("ok");

        // Reverse-geocode with Nominatim (OpenStreetMap) — free, no API key needed
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          if (!resp.ok) return;
          const geo = await resp.json() as {
            display_name?: string;
            address?: {
              road?: string;
              pedestrian?: string;
              path?: string;
              quarter?: string;
              neighbourhood?: string;
              suburb?: string;
              city_district?: string;
              town?: string;
              village?: string;
              city?: string;
              county?: string;
              state?: string;
            };
          };

          const a = geo.address ?? {};

          // Build street line: road / path / pedestrian
          const street = a.road ?? a.pedestrian ?? a.path ?? "";

          // Sector / area: suburb or quarter or neighbourhood
          const sector = a.suburb ?? a.quarter ?? a.neighbourhood ?? a.city_district ?? "";

          // Build full address string
          const parts = [street, sector, a.city ?? a.town ?? a.village ?? "Kigali"]
            .filter(Boolean);
          const fullAddress = parts.join(", ");

          // Nearby landmark hint: city district or county
          const landmarkHint = a.city_district ?? a.county ?? "";

          if (fullAddress) setAddress(fullAddress);
          if (landmarkHint && !landmark) setLandmark(landmarkHint);
        } catch {
          // Reverse geocoding failed silently — user can still type the address
        }
      },
      () => setGeoStatus("denied"),
      { timeout: 10_000 },
    );
  }

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

  async function fetchQrCode(checkout: CheckoutResult) {
    try {
      const url = `/api/qr-payment?orderId=${encodeURIComponent(checkout.orderId)}&amount=${encodeURIComponent(checkout.totalRwf)}&orderNumber=${encodeURIComponent(checkout.orderNumber)}`;
      const response = await fetch(url);
      const data = await response.json().catch(() => null);
      if (!data?.qrDataUrl) {
        setError("Could not generate QR code. Your order is confirmed — please contact the store.");
      }
    } catch {
      setError("Could not generate QR code. Your order is confirmed — please contact the store.");
    }
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (subtotalRwf < 2500) {
      return setError("Minimum order amount is 2,500 RWF. Please add more items to your basket.");
    }

    if (!/^(\+?2507[2389]\d{7}|07[2389]\d{7})$/.test(phone)) {
      return setError("Please enter a valid Rwandan phone number (e.g., 0788123456).");
    }

    if (fulfilment === "delivery" && !clientCoords) {
      return setError("Please use 'Detect my location' so we can calculate the exact delivery fee.");
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
        clientLat: clientCoords?.lat,
        clientLng: clientCoords?.lng,
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
    if (paymentProvider === "cash" || paymentProvider === "qr_code") {
      clearCart();
      if (paymentProvider === "qr_code") void fetchQrCode(data);
    } else {
      void pollPayment(data);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[70vh] py-24 text-center text-sm text-muted">
        {t("protectedRoute")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center gap-0 px-4 py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/10">
          <LockKeyhole className="h-8 w-8 text-brand" />
        </span>
        <h1 className="mt-6 text-3xl font-black">Sign in to checkout</h1>
        <p className="mt-3 max-w-sm leading-7 text-muted">
          You need a Simba account to place orders, track deliveries, and pay with QR code or
          mobile money. It takes less than a minute to create one.
        </p>

        {/* Simba QR panel — visible even before sign-in so users know the option exists */}
        <div className="mt-8 w-full max-w-xs">
          <SimbaQrPanel compact />
        </div>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/signin?next=/checkout"
            className="button-primary w-full justify-center"
          >
            <LockKeyhole className="h-4 w-4" />
            Sign in to your account
          </Link>
          <Link
            href="/signup?next=/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-5 py-3 text-sm font-black transition hover:border-brand"
          >
            Create a free account
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Already browsing?{" "}
          <Link href="/shop" className="font-bold text-brand">
            Continue shopping
          </Link>
        </p>
      </div>
    );
  }

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

  if (result?.qrPayment) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-lg px-4 py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/10">
          <QrCode className="h-8 w-8 text-brand" />
        </span>
        <h1 className="mt-6 text-3xl font-black">Scan to pay</h1>
        <p className="mt-3 leading-7 text-muted">
          Scan the Simba store QR code with MTN MoMo or Airtel Money to pay{" "}
          <strong>{rwf.format(result.totalRwf)}</strong> for order{" "}
          <strong>{result.orderNumber}</strong>.
        </p>

        <div className="mt-8">
          <SimbaQrPanel />
        </div>

        <p className="mt-6 text-xs text-muted">
          Order confirmed · Reference:{" "}
          <span className="font-bold text-ink">{result.orderNumber}</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          Enter exactly <strong>{rwf.format(result.totalRwf)}</strong> when prompted by your payment app.
        </p>
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
                {/* Geolocation */}
                <div className="rounded-lg border border-line bg-canvas p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold">Your delivery location</p>
                      {geoStatus === "ok" && distanceKm != null ? (
                        <p className="mt-1 text-xs text-[#16865c] font-bold">
                          {distanceKm.toFixed(1)} km from {selectedBranch.name} · Fee: {rwf.format(feeRwf!)}
                          {address && <span className="block font-normal text-muted mt-0.5">Address filled from GPS</span>}
                        </p>
                      ) : geoStatus === "denied" ? (
                        <p className="mt-1 text-xs text-red-600">Location denied — enter address manually below.</p>
                      ) : (
                        <p className="mt-1 text-xs text-muted">We use your GPS to calculate an exact, fair fee.</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={geoStatus === "loading"}
                      className="flex shrink-0 items-center gap-2 rounded-md bg-brand px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      {geoStatus === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
                      {geoStatus === "ok" ? "Re-detect" : "Detect my location"}
                    </button>
                  </div>
                </div>

                {addresses.length > 0 && <div><label className="form-label">Saved address</label><select defaultValue="" onChange={(event) => { const saved = addresses.find((item) => item.id === event.target.value); if (saved) chooseSavedAddress(saved); }} className="form-input"><option value="">Enter an address or choose saved</option>{addresses.map((item) => <option key={item.id} value={item.id}>{item.label} - {item.street_address}, {item.district}</option>)}</select></div>}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="form-label">Preferred time</label><select required value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value as typeof deliverySlot)} className="form-input sm:col-span-2">{deliveryTimeSlots.map((slot) => <option key={slot}>{slot}</option>)}</select></div>
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
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button type="button" onClick={() => setPaymentProvider("mtn_momo")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "mtn_momo" ? "border-[#f4c400] bg-[#f4c400]/10" : "border-line"}`}><Smartphone className="h-5 w-5 text-[#b89100]" /><b className="mt-3 block text-sm">MTN MoMo</b><small className="text-muted">Request to Pay</small></button>
              <button type="button" onClick={() => setPaymentProvider("airtel_money")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "airtel_money" ? "border-red-500 bg-red-500/10" : "border-line"}`}><Smartphone className="h-5 w-5 text-red-600" /><b className="mt-3 block text-sm">Airtel Money</b><small className="text-muted">Phone approval</small></button>
              <button type="button" onClick={() => setPaymentProvider("cash")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "cash" ? "border-[#16865c] bg-[#16865c]/10" : "border-line"}`}><Banknote className="h-5 w-5 text-[#16865c]" /><b className="mt-3 block text-sm">Cash</b><small className="text-muted">Pay on fulfilment</small></button>
              <button type="button" onClick={() => setPaymentProvider("qr_code")} className={`min-h-24 rounded-lg border p-4 text-left ${paymentProvider === "qr_code" ? "border-brand bg-brand/10" : "border-line"}`}><QrCode className="h-5 w-5 text-brand" /><b className="mt-3 block text-sm">QR Code</b><small className="text-muted">Scan at cashier</small></button>
            </div>
            <div><label className="form-label">Rwandan phone number</label><div className="relative"><Phone className="input-icon" /><input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input pl-11" placeholder="0788123456" /></div></div>
          </section>

          {error && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
          <button disabled={!cart.length || placingOrder} className="button-primary w-full disabled:opacity-50">{placingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : paymentProvider === "cash" ? <Banknote className="h-4 w-4" /> : paymentProvider === "qr_code" ? <QrCode className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}{placingOrder ? "Creating secure order..." : paymentProvider === "cash" ? `Place order · ${rwf.format(totalRwf)}` : paymentProvider === "qr_code" ? `Generate QR code · ${rwf.format(totalRwf)}` : `Request ${paymentProvider === "mtn_momo" ? "MTN MoMo" : "Airtel Money"} payment · ${rwf.format(totalRwf)}`}</button>
        </form>

        <aside className="h-fit rounded-xl border border-line bg-canvas p-5 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-black">Order summary</h2>
          <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">{cart.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 text-xs"><span className="text-muted">{quantity} × {product.name}</span><span className="shrink-0 font-bold">{rwf.format(Math.round(product.price * 1450) * quantity)}</span></div>)}</div>
          <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{rwf.format(subtotalRwf)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery{distanceKm != null ? ` · ${distanceKm.toFixed(1)} km` : ""}</span><span>{feeRwf == null ? <span className="text-muted text-xs">detect location</span> : feeRwf === 0 ? "Free" : rwf.format(feeRwf)}</span></div>
            <div className="flex justify-between text-lg font-black"><span>Total</span><span>{feeRwf == null && fulfilment === "delivery" ? <span className="text-sm text-muted">+ delivery</span> : rwf.format(totalRwf)}</span></div>
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

          {/* Static Simba store QR — shown whenever QR Code payment is selected */}
          {paymentProvider === "qr_code" && (
            <div className="mt-5 border-t border-line pt-5">
              <SimbaQrPanel compact />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
