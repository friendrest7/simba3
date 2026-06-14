"use client";

import { BadgeCheck, Loader2, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "./store-provider";

type Review = { id: string; rating: number; title: string | null; message: string; verified_purchase: boolean; created_at: string; customerName: string };
type EligibleOrder = { id: string; order_number: string; status: string; items: Array<{ productId: string | null }> };

export function ProductReviews({ productKey }: { productKey: string }) {
  const { user } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [orders, setOrders] = useState<EligibleOrder[]>([]);
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/product-reviews?productKey=${encodeURIComponent(productKey)}`).then((response) => response.json()),
      user ? fetch("/api/orders").then((response) => response.json()) : Promise.resolve({ orders: [] }),
    ]).then(([reviewData, orderData]) => {
      setReviews(reviewData.reviews || []);
      setAverage(reviewData.average || 0);
      const eligible = (orderData.orders || []).filter((order: EligibleOrder) => order.status === "delivered" && order.items.some((item) => item.productId === productKey));
      setOrders(eligible);
      setOrderId(eligible[0]?.id || "");
    }).finally(() => setLoading(false));
  }, [productKey, user]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/product-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey, orderId, rating, title, message }),
    });
    const data = await response.json().catch(() => null);
    setSubmitting(false);
    if (!response.ok) return setError(data?.error || "Review could not be submitted.");
    setReviews((current) => [data.review, ...current]);
    setMessage("");
    setTitle("");
  }

  return (
    <section className="border-t border-line py-14">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><span className="eyebrow">Ratings & reviews</span><h2 className="mt-2 text-2xl font-black">{reviews.length ? `${average} out of 5` : "Be the first verified reviewer"}</h2></div><p className="flex items-center gap-2 text-sm font-bold"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /> {reviews.length} verified reviews</p></div>
      {loading ? <div className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-brand" /></div> : <div className="mt-7 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          {orders.length ? <form onSubmit={submit} className="rounded-xl border border-line p-5"><h3 className="font-black">Review your purchase</h3><div className="mt-4 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} className="icon-button" aria-label={`${value} stars`}><Star className={`h-5 w-5 text-amber-500 ${value <= rating ? "fill-current" : ""}`} /></button>)}</div><select value={orderId} onChange={(event) => setOrderId(event.target.value)} className="form-input mt-4">{orders.map((order) => <option key={order.id} value={order.id}>{order.order_number}</option>)}</select><input value={title} onChange={(event) => setTitle(event.target.value)} className="form-input mt-3" placeholder="Review title (optional)" /><textarea required minLength={3} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-3 min-h-28 w-full rounded-md border border-line bg-transparent p-3 text-sm" placeholder="Share your experience" />{error && <p role="alert" className="mt-3 text-xs font-bold text-red-600">{error}</p>}<button disabled={submitting} className="button-primary mt-4 w-full">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit verified review</button></form> : <div className="rounded-xl border border-line p-5 text-sm text-muted"><BadgeCheck className="h-6 w-6 text-brand" /><p className="mt-3 font-black text-ink">Verified purchases only</p><p className="mt-2 leading-6">{user ? "This form unlocks after this product is delivered in one of your orders." : "Sign in and purchase this product to leave a review."}</p></div>}
        </div>
        <div className="space-y-3">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-xl border border-line p-5"><div className="flex items-center justify-between gap-3"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 text-amber-500 ${value <= review.rating ? "fill-current" : ""}`} />)}</div>{review.verified_purchase && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-[#16865c]"><BadgeCheck className="h-4 w-4" /> Verified buyer</span>}</div>{review.title && <h3 className="mt-3 font-black">{review.title}</h3>}<p className="mt-2 text-sm leading-6 text-muted">{review.message}</p><p className="mt-3 text-xs font-bold">{review.customerName} · {new Date(review.created_at).toLocaleDateString("en-RW")}</p></article>) : <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">No reviews have been submitted for this product yet.</div>}</div>
      </div>}
    </section>
  );
}
