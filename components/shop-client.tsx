"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Banknote, Bot, Building2, Loader2, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { branches, products } from "@/lib/data";
import { useStore } from "./store-provider";

export function ShopClient() {
  const { selectedBranchId, setSelectedBranchId, managedProducts } = useStore();
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get("q") || "";
  const initialCategory = params.get("category") || "All";
  const isFreshDeals = initialCategory === "Fruits";
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState("All prices");
  const [searchInsight, setSearchInsight] = useState("");
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState("featured");
  const marketplaceProducts = useMemo(() => [...managedProducts, ...products], [managedProducts]);
  const categories = ["All", ...Array.from(new Set(marketplaceProducts.map((product) => product.category)))];
  const priceRanges = [
    { label: "All prices", caption: "Full marketplace", color: "border-[#d94b1b]" },
    { label: "Under FRw 2,000", caption: "Quick essentials", color: "border-[#16865c]" },
    { label: "FRw 2,000 - 10,000", caption: "Everyday value", color: "border-[#f0b323]" },
    { label: "FRw 10,000 - 30,000", caption: "Family shopping", color: "border-[#3867d6]" },
    { label: "FRw 30,000+", caption: "Premium finds", color: "border-[#8b4bb5]" },
  ];

  useEffect(() => {
    const nextQuery = params.get("q") || "";
    setDraftQuery(nextQuery);
    setQuery(nextQuery);
    setCategory(params.get("category") || "All");
  }, [params]);

  const filtered = useMemo(() => marketplaceProducts.filter((product) =>
    (category === "All" || product.category.toLowerCase().includes(category.toLowerCase())) &&
    `${product.name} ${product.category} ${product.seller}`.toLowerCase().includes(query.toLowerCase()) &&
    (() => {
      const rwf = product.price * 1450;
      if (priceRange === "Under FRw 2,000") return rwf < 2000;
      if (priceRange === "FRw 2,000 - 10,000") return rwf >= 2000 && rwf <= 10000;
      if (priceRange === "FRw 10,000 - 30,000") return rwf > 10000 && rwf <= 30000;
      if (priceRange === "FRw 30,000+") return rwf > 30000;
      return true;
    })()
  ).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "stock") return b.stock - a.stock;
    return Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || b.reviews - a.reviews;
  }), [query, category, priceRange, sort, marketplaceProducts]);

  async function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const nextQuery = draftQuery.trim();
    setQuery(nextQuery);
    setSearchInsight("");

    const nextParams = new URLSearchParams(params.toString());
    if (nextQuery) nextParams.set("q", nextQuery);
    else nextParams.delete("q");
    router.replace(`/shop${nextParams.size ? `?${nextParams.toString()}` : ""}`, { scroll: false });

    if (!nextQuery) return;
    window.dispatchEvent(new CustomEvent("simba:ask", {
      detail: `I searched the Simba marketplace for "${nextQuery}". Help me compare the best matching products.`,
    }));
    setSearching(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `I searched for "${nextQuery}". Briefly explain the most relevant matching supermarket products and ask one useful follow-up question.`,
          }],
        }),
      });
      const data = await response.json();
      setSearchInsight(data.reply || `I found ${filtered.length} related products.`);
    } catch {
      setSearchInsight(`I filtered the marketplace for "${nextQuery}". You can refine by category, budget, or branch.`);
    } finally {
      setSearching(false);
    }
  }

  function askAssistant() {
    const prompt = query.trim()
      ? `Help me compare the products related to "${query}".`
      : "Help me choose something from the marketplace.";
    window.dispatchEvent(new CustomEvent("simba:ask", { detail: prompt }));
  }

  return (
    <div className="pb-12">
      <section
        className="relative min-h-[330px] overflow-hidden bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/images/landing.jpg')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,35,32,.70),rgba(0,35,32,.36)_55%,rgba(0,35,32,.10))]" />
        <div className="relative mx-auto flex min-h-[330px] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/25 bg-black/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.16em] text-white/85 backdrop-blur-sm">
              {isFreshDeals ? "Fresh deals from Simba Rwanda" : "Simba Rwanda marketplace"}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              {isFreshDeals ? "Fresh picks. Better prices." : "Find your next good thing."}
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-white/80">
              {isFreshDeals
                ? "Shop seasonal fruit and fresh-market favourites selected for value, quality, and fast local delivery."
                : "Fresh food, pantry staples, and Simba favourites delivered from trusted Rwanda branches."}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
      <section className="-mt-7 relative z-10 flex flex-col gap-4 rounded-md border border-line bg-white/95 p-5 shadow-sm backdrop-blur dark:bg-[#202126]/95 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand"><Building2 className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-black">Shopping from {selectedBranch.name}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted"><MapPin className="h-3 w-3" /> {selectedBranch.address}</p>
          </div>
        </div>
        <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="form-input sm:max-w-[300px]" aria-label="Change Simba branch">
          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>)}
        </select>
      </section>

      <section className="mt-6 rounded-md bg-brand p-5 text-white shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="lg:w-[340px]">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/75"><Sparkles className="h-4 w-4" /> Market quick finder</p>
            <p className="mt-2 text-lg font-black">Search products and ask Simba at once.</p>
          </div>
          <form onSubmit={submitSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#777]" />
            <input
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Try: affordable milk, breakfast for a family, healthy snacks..."
              className="h-13 w-full rounded-md border border-white/30 bg-white py-3 pl-12 pr-16 text-sm text-[#1b1b1b] outline-none focus:ring-2 focus:ring-white/40"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 grid h-10 w-11 place-items-center rounded-md bg-[#16865c] text-white" title="Search products and ask Simba"><Search className="h-4 w-4" /></button>
          </form>
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-md border border-line bg-white shadow-soft dark:bg-white/[.03]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#f0b323]/15 text-[#a87400]"><Banknote className="h-5 w-5" /></span>
            <div><h2 className="text-sm font-black">Shop by budget</h2><p className="mt-1 text-[11px] text-muted">Choose a comfortable price range for your Rwanda order.</p></div>
          </div>
          <span className="rounded-md bg-[#16865c]/10 px-3 py-2 text-xs font-black text-[#16865c]">{filtered.length} products in budget</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
          {priceRanges.map((range) => (
            <button key={range.label} onClick={() => setPriceRange(range.label)} className={`min-h-24 border-b-4 bg-canvas px-4 py-4 text-left transition hover:bg-black/[.025] dark:hover:bg-white/[.04] ${range.color} ${priceRange === range.label ? "bg-black/[.04] dark:bg-white/[.08]" : ""}`}>
              <p className="text-sm font-black">{range.label}</p><p className="mt-2 text-[10px] text-muted">{range.caption}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 border-y border-line py-5 lg:flex-row lg:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="input-icon" />
          <input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Search milk, bread, rice, snacks and more..." className="form-input pl-11 pr-14" />
          <button type="submit" className="absolute right-1.5 top-1.5 grid h-9 w-10 place-items-center rounded-md bg-brand text-white" title="Filter products"><Search className="h-4 w-4" /></button>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {categories.map((item) => (
            <button onClick={() => setCategory(item)} key={item} className={`h-10 shrink-0 rounded-md px-4 text-xs font-bold ${category === item ? "bg-ink text-canvas" : "border border-line"}`}>
              {item}
            </button>
          ))}
        </div>
        <button onClick={askAssistant} className="button-primary !min-h-10 shrink-0 !px-4"><Sparkles className="h-4 w-4" /> Ask Simba</button>
      </div>

      {(searching || searchInsight) && (
        <section className="mt-5 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-xs font-black text-brand">{searching ? "Simba is checking your results..." : "Simba search guide"}</p>
            {!searching && <p className="mt-1 text-sm leading-6 text-muted">{searchInsight}</p>}
          </div>
        </section>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted"><b className="text-ink">{filtered.length}</b> products found</p>
        <label className="flex items-center gap-2 text-xs font-bold">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-md border border-line bg-canvas px-3 py-2 text-xs font-bold outline-none">
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Highest rated</option>
            <option value="stock">Most available</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="py-24 text-center">
          <h2 className="text-xl font-black">No products found</h2>
          <p className="mt-2 text-sm text-muted">Try a broader search or ask Simba for a recommendation.</p>
        </div>
      )}
      </div>
    </div>
  );
}
