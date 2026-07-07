"use client";

import { Flame, Gift, ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data";
import { useStore } from "@/components/store-provider";
import Link from "next/link";
import type { Product } from "@/lib/data";

// Most-bought = highest reviews * rating score (proxy for purchase volume)
const mostBought = [...products]
  .sort((a, b) => b.reviews * b.rating - a.reviews * a.rating)
  .slice(0, 12);

// BOGO deals — pair up popular products into buy-one-get-one bundles
const bogoPairs: { buy: Product; get: Product; label: string }[] = [
  {
    buy: products.find((p) => p.id === "simba-chutney-120g")!,
    get: products.find((p) => p.id === "simba-chutney-36g")!,
    label: "Buy 120g, Get a Free Mini Bag",
  },
  {
    buy: products.find((p) => p.id === "simba-smoked-beef-120g")!,
    get: products.find((p) => p.id === "simba-smoked-beef-36g")!,
    label: "Buy Smoked Beef, Get a Free Mini",
  },
  {
    buy: products.find((p) => p.id === "premium-rice-5kg")!,
    get: products.find((p) => p.id === "sunflower-oil-1l")!,
    label: "Buy Rice 5kg, Get Cooking Oil Free",
  },
  {
    buy: products.find((p) => p.id === "inyange-fresh-milk-1l")!,
    get: products.find((p) => p.id === "fresh-white-bread")!,
    label: "Buy Milk 1L, Get a Free Bread Loaf",
  },
  {
    buy: products.find((p) => p.id === "mineral-water-6pack")!,
    get: products.find((p) => p.id === "strawberry-yogurt-500g")!,
    label: "Buy Water Pack, Get Yogurt Free",
  },
  {
    buy: products.find((p) => p.id === "roasted-almonds")!,
    get: products.find((p) => p.id === "simba-salt-vinegar-60g")!,
    label: "Buy Almonds, Get Chips Free",
  },
];

// Rising fast — products with high rating but fewer reviews (newly popular)
const risingFast = [...products]
  .filter((p) => p.rating >= 4.7 && p.reviews < 250)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 6);

export default function TrendingPage() {
  const { addToCart } = useStore();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-amber-500 to-orange-400 px-8 py-10 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Live this week</span>
          </div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Trending at Simba</h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            The most-bought products right now, exclusive buy-one-get-one deals, and fast-rising favourites — updated weekly based on real purchase data.
          </p>
          <Link href="/shop" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-brand hover:bg-white/90">
            <ShoppingCart className="h-4 w-4" /> Shop All Products
          </Link>
        </div>
        {/* Decorative blobs */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-24 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Stats bar */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: "Most Bought", value: "12 Products", color: "text-brand" },
          { icon: Gift, label: "BOGO Deals", value: "6 Active Offers", color: "text-green-600 dark:text-green-400" },
          { icon: Zap, label: "Rising Fast", value: "6 New Arrivals", color: "text-amber-600 dark:text-amber-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-4 shadow-sm">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand/10 ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase text-muted">{label}</p>
              <p className="text-sm font-black text-ink dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Most Bought ── */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black">Most Bought</h2>
            <p className="text-xs text-muted">Ranked by customer purchases &amp; ratings this week</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {mostBought.map((product, i) => (
            <div key={product.id} className="relative">
              {i < 3 && (
                <span className={`absolute -left-1 -top-1 z-10 grid h-6 w-6 place-items-center rounded-full text-[10px] font-black text-white shadow ${
                  i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : "bg-amber-700"
                }`}>
                  #{i + 1}
                </span>
              )}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* ── BOGO Deals ── */}
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black">Buy One, Get One Free</h2>
            <p className="text-xs text-muted">Limited offers — add the featured product to your cart to unlock the free item</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bogoPairs.map(({ buy, get, label }) => (
            <div key={buy.id} className="group relative overflow-hidden rounded-2xl border border-line bg-canvas p-5 shadow-sm transition hover:border-brand hover:shadow-md">
              {/* BOGO badge */}
              <span className="absolute right-4 top-4 rounded-full bg-green-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                BOGO FREE
              </span>

              <p className="mb-4 pr-20 text-xs font-black text-green-600 dark:text-green-400">{label}</p>

              <div className="flex items-center gap-3">
                {/* Buy product */}
                <div className="flex flex-1 flex-col items-center rounded-xl bg-brand/5 p-3 text-center dark:bg-white/5">
                  <p className="mb-1 text-[9px] font-black uppercase text-muted">You Buy</p>
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={buy.image} alt={buy.name} className="h-full w-full object-contain p-1" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-ink dark:text-white">{buy.name}</p>
                  <p className="mt-0.5 text-xs font-black text-brand">
                    {buy.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </p>
                </div>

                {/* Plus sign */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-black text-white shadow">
                  +
                </div>

                {/* Get product */}
                <div className="flex flex-1 flex-col items-center rounded-xl bg-green-50 p-3 text-center dark:bg-green-900/20">
                  <p className="mb-1 text-[9px] font-black uppercase text-green-600 dark:text-green-400">You Get FREE</p>
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={get.image} alt={get.name} className="h-full w-full object-contain p-1" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-ink dark:text-white">{get.name}</p>
                  <p className="mt-0.5 text-xs font-black text-muted line-through">
                    {get.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </p>
                </div>
              </div>

              {/* Savings callout */}
              <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  You save: {get.price.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>
                <button
                  onClick={() => { addToCart(buy); addToCart(get); }}
                  className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-brand/90"
                >
                  <ShoppingCart className="h-3 w-3" /> Add Both
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rising Fast ── */}
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black">Rising Fast</h2>
            <p className="text-xs text-muted">High-rated products gaining momentum — buy before they sell out</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {risingFast.map((product) => (
            <div key={product.id} className="relative">
              <span className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black text-white shadow">
                <Zap className="h-2.5 w-2.5" /> Rising
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-2xl bg-gradient-to-r from-brand/10 to-amber-50 border border-brand/20 p-8 text-center dark:from-brand/10 dark:to-white/5">
        <Flame className="mx-auto h-8 w-8 text-brand" />
        <h2 className="mt-3 text-2xl font-black">Don&apos;t miss out</h2>
        <p className="mt-2 text-sm text-muted">These deals refresh every week. Shop now before stocks run out.</p>
        <Link href="/shop" className="button-primary mt-5 inline-flex">
          Browse All Products
        </Link>
      </section>
    </div>
  );
}
