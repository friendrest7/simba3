"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Building2, Loader2, MapPin, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { branches, Product } from "@/lib/data";
import { cleanSearchQuery, searchProducts } from "@/lib/product-search";
import { useStore } from "./store-provider";

const priceRanges = ["All prices", "Under FRw 2,000", "FRw 2,000 - 10,000", "FRw 10,000 - 30,000", "FRw 30,000+"];

export function ShopClient() {
  const {
    selectedBranchId,
    setSelectedBranchId,
    managedProducts,
    savedProductIds,
    t,
  } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const [draftQuery, setDraftQuery] = useState(params.get("q") || "");
  const [query, setQuery] = useState(cleanSearchQuery(params.get("q") || ""));
  const [category, setCategory] = useState(params.get("category") || "All");
  const [priceRange, setPriceRange] = useState("All prices");
  const [sort, setSort] = useState("featured");
  const [searchInsight, setSearchInsight] = useState("");
  const [searching, setSearching] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<string[]>(["All"]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogHasMore, setCatalogHasMore] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const savedOnly = params.get("saved") === "true";

  useEffect(() => {
    const nextQuery = cleanSearchQuery(params.get("q") || "");
    setDraftQuery(nextQuery);
    setQuery(nextQuery);
    setCategory(params.get("category") || "All");
    setCatalogPage(1);
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    const requestParams = new URLSearchParams({
      q: query,
      category,
      price: priceRange,
      sort,
      page: String(catalogPage),
    });
    setCatalogLoading(true);
    fetch(`/api/products?${requestParams.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog request failed.");
        return response.json();
      })
      .then((data: { products?: Product[]; categories?: string[]; total?: number; hasMore?: boolean }) => {
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        setCatalogProducts((current) => catalogPage === 1 ? nextProducts : [...current, ...nextProducts]);
        if (Array.isArray(data.categories)) setCatalogCategories(data.categories);
        setCatalogTotal(typeof data.total === "number" ? data.total : nextProducts.length);
        setCatalogHasMore(Boolean(data.hasMore));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (catalogPage === 1) setCatalogProducts([]);
        setCatalogHasMore(false);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [query, category, priceRange, sort, catalogPage]);

  const categories = useMemo(
    () => Array.from(new Set([...catalogCategories, ...managedProducts.map((product) => product.category)])),
    [catalogCategories, managedProducts],
  );

  const managedMatches = useMemo(() => {
    const candidates = managedProducts.filter((product) => category === "All" || product.category === category);
    const searched = query ? searchProducts(candidates, query) : candidates;
    return [...searched].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "stock") return b.stock - a.stock;
      return 0;
    });
  }, [managedProducts, category, query, sort]);

  const allDisplayedProducts = useMemo(() => [...managedMatches, ...catalogProducts], [managedMatches, catalogProducts]);
  const displayedProducts = savedOnly
    ? allDisplayedProducts.filter((product) => savedProductIds.includes(product.id))
    : allDisplayedProducts;
  const resultCount = savedOnly ? displayedProducts.length : catalogTotal + managedMatches.length;

  async function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const nextQuery = cleanSearchQuery(draftQuery);
    setDraftQuery(nextQuery);
    setQuery(nextQuery);
    setCatalogPage(1);
    setSearchInsight("");

    const nextParams = new URLSearchParams(params.toString());
    if (nextQuery) nextParams.set("q", nextQuery);
    else nextParams.delete("q");
    nextParams.delete("saved");
    router.replace(`/shop${nextParams.size ? `?${nextParams}` : ""}`, { scroll: false });
  }

  async function askAssistant() {
    const prompt = query || cleanSearchQuery(draftQuery) || "Help me choose supermarket products";
    setSearching(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await response.json();
      setSearchInsight(data.reply || "");
    } catch {
      setSearchInsight(t("broadenSearch"));
    } finally {
      setSearching(false);
    }
  }

  function selectCategory(value: string) {
    setCategory(value);
    setCatalogPage(1);
    const nextParams = new URLSearchParams(params.toString());
    if (value === "All") nextParams.delete("category");
    else nextParams.set("category", value);
    router.replace(`/shop${nextParams.size ? `?${nextParams}` : ""}`, { scroll: false });
  }

  return (
    <div className="pb-16">
      <section className="border-b border-line bg-white py-10 dark:bg-white/[.02]">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
          <span className="eyebrow">{t("marketplace")}</span>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{savedOnly ? t("wishlist") : t("marketplace")}</h1>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <form onSubmit={submitSearch} className="relative flex-1">
              <Search className="input-icon" />
              <input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder={t("search")} className="form-input pl-11 pr-28" />
              <button className="absolute right-1.5 top-1.5 h-9 rounded-md bg-brand px-4 text-xs font-black text-white">{t("searchProducts")}</button>
            </form>
            <label className="flex min-w-0 items-center gap-3 rounded-md border border-line px-4 py-2 lg:max-w-sm">
              <MapPin className="h-4 w-4 shrink-0 text-brand" />
              <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none">
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Building2 className="h-4 w-4" /> {selectedBranch.address}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
        <aside className="hidden h-fit rounded-lg border border-line bg-canvas p-5 lg:block">
          <h2 className="font-black">{t("category")}</h2>
          <div className="mt-4 space-y-1">
            {categories.map((item) => (
              <button key={item} onClick={() => selectCategory(item)} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${category === item ? "bg-brand font-black text-white" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                {item === "All" ? t("allCategories") : item}
              </button>
            ))}
          </div>
          <h2 className="mt-7 border-t border-line pt-6 font-black">{t("price")}</h2>
          <div className="mt-4 space-y-2">
            {priceRanges.map((range) => (
              <label key={range} className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                <input type="radio" name="price" checked={priceRange === range} onChange={() => { setPriceRange(range); setCatalogPage(1); }} />
                {range === "All prices" ? t("allPrices") : range}
              </label>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <p className="text-sm text-muted"><b className="text-ink">{resultCount}</b> {t("productsFound")}</p>
            <div className="flex items-center gap-2">
              <button onClick={askAssistant} className="button-secondary !min-h-10 !px-4"><Sparkles className="h-4 w-4" /> {t("askSimba")}</button>
              <label className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <select value={sort} onChange={(event) => { setSort(event.target.value); setCatalogPage(1); }} className="h-10 rounded-md border border-line bg-canvas px-3 text-xs font-bold">
                  <option value="featured">{t("featured")}</option>
                  <option value="price-low">{t("priceLow")}</option>
                  <option value="price-high">{t("priceHigh")}</option>
                  <option value="rating">{t("highestRated")}</option>
                  <option value="stock">{t("mostAvailable")}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {categories.map((item) => (
              <button key={item} onClick={() => selectCategory(item)} className={`h-9 shrink-0 rounded-full px-4 text-xs font-bold ${category === item ? "bg-brand text-white" : "border border-line"}`}>
                {item === "All" ? t("allCategories") : item}
              </button>
            ))}
          </div>

          {(searching || searchInsight) && (
            <section className="mt-5 flex gap-3 rounded-lg border border-brand/20 bg-brand/5 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              </span>
              <p className="text-sm leading-6 text-muted">{searching ? "Simba is checking your results..." : searchInsight}</p>
            </section>
          )}

          {displayedProducts.length ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {catalogHasMore && !savedOnly && (
                <div className="mt-10 text-center">
                  <button disabled={catalogLoading} onClick={() => setCatalogPage((page) => page + 1)} className="button-secondary disabled:opacity-60">
                    {catalogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {catalogLoading ? t("loadingProducts") : t("loadMore")}
                  </button>
                </div>
              )}
            </>
          ) : catalogLoading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm font-bold text-muted"><Loader2 className="h-5 w-5 animate-spin text-brand" /> {t("loadingProducts")}</div>
          ) : (
            <div className="py-24 text-center">
              <h2 className="text-xl font-black">{t("noProducts")}</h2>
              <p className="mt-2 text-sm text-muted">{t("broadenSearch")}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
