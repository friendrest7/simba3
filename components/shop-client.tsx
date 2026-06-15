"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { branches, Product } from "@/lib/data";
import { cleanSearchQuery } from "@/lib/product-search";
import { useStore } from "./store-provider";

type Subcategory = { id: number; name: string; category: string };
type CatalogResponse = {
  products: Product[];
  categories: string[];
  subcategories: Subcategory[];
  total: number;
  page: number;
  pageCount: number;
  catalog: { productCount: number; categoryCount: number; subcategoryCount: number };
};

type ShopClientProps = {
  initialProducts?: Product[];
  initialCategories?: string[];
  initialSubcategories?: Subcategory[];
  initialTotal?: number;
  initialPageCount?: number;
};

const availabilityOptions = [
  ["all", "All availability"],
  ["in-stock", "In stock"],
  ["low-stock", "Low stock"],
  ["out-of-stock", "Out of stock"],
] as const;

export function ShopClient({
  initialProducts = [],
  initialCategories = [],
  initialSubcategories = [],
  initialTotal = 789,
  initialPageCount = 33,
}: ShopClientProps) {
  const { selectedBranchId, setSelectedBranchId, savedProductIds, t } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const savedOnly = params.get("saved") === "true";

  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [subcategory, setSubcategory] = useState(params.get("subcategory") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [availability, setAvailability] = useState(params.get("availability") || "all");
  const [sort, setSort] = useState(params.get("sort") || "relevance");
  const [page, setPage] = useState(Math.max(1, Number(params.get("page") || 1)));
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [total, setTotal] = useState(initialTotal);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [catalogMeta, setCatalogMeta] = useState({ productCount: 789, categoryCount: 11, subcategoryCount: 98 });
  const [loading, setLoading] = useState(!initialProducts.length);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams();
      const cleaned = cleanSearchQuery(query);
      if (cleaned) next.set("q", cleaned);
      if (category !== "All") next.set("category", category);
      if (subcategory) next.set("subcategory", subcategory);
      if (minPrice) next.set("minPrice", minPrice);
      if (maxPrice) next.set("maxPrice", maxPrice);
      if (availability !== "all") next.set("availability", availability);
      if (sort !== "relevance") next.set("sort", sort);
      if (page > 1) next.set("page", String(page));
      if (savedOnly) next.set("saved", "true");
      router.replace(`/shop${next.size ? `?${next.toString()}` : ""}`, { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [availability, category, maxPrice, minPrice, page, query, router, savedOnly, sort, subcategory]);

  useEffect(() => {
    const controller = new AbortController();
    const requestParams = new URLSearchParams({
      q: cleanSearchQuery(query),
      category,
      availability,
      sort,
      page: String(page),
      pageSize: savedOnly ? "96" : "24",
    });
    if (subcategory) requestParams.set("subcategory", subcategory);
    if (minPrice) requestParams.set("minPrice", minPrice);
    if (maxPrice) requestParams.set("maxPrice", maxPrice);

    setLoading(true);
    setError("");
    fetch(`/api/products?${requestParams.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("The product catalog could not be loaded.");
        return response.json() as Promise<CatalogResponse>;
      })
      .then((data) => {
        setProducts(data.products);
        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setTotal(data.total);
        setPageCount(Math.max(1, data.pageCount));
        setCatalogMeta(data.catalog);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "The product catalog could not be loaded.");
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [availability, category, maxPrice, minPrice, page, query, savedOnly, sort, subcategory]);

  const displayedProducts = useMemo(
    () => savedOnly ? products.filter((product) => savedProductIds.includes(product.id)) : products,
    [products, savedOnly, savedProductIds],
  );

  function resetPage<T>(setter: (value: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setSubcategory("");
    setMinPrice("");
    setMaxPrice("");
    setAvailability("all");
    setSort("relevance");
    setPage(1);
  }

  const filterControls = (
    <>
      <div>
        <label className="form-label" htmlFor="catalog-category">{t("category")}</label>
        <select id="catalog-category" value={category} onChange={(event) => { resetPage(setCategory, event.target.value); setSubcategory(""); }} className="form-input">
          <option value="All">{t("allCategories")}</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="catalog-subcategory">Subcategory</label>
        <select id="catalog-subcategory" value={subcategory} onChange={(event) => resetPage(setSubcategory, event.target.value)} className="form-input">
          <option value="">All subcategories</option>
          {subcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="form-label">Price range (RWF)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Minimum price in RWF" inputMode="numeric" type="number" min="0" value={minPrice} onChange={(event) => resetPage(setMinPrice, event.target.value)} className="form-input" placeholder="Min" />
          <input aria-label="Maximum price in RWF" inputMode="numeric" type="number" min="0" value={maxPrice} onChange={(event) => resetPage(setMaxPrice, event.target.value)} className="form-input" placeholder="Max" />
        </div>
      </fieldset>
      <div>
        <label className="form-label" htmlFor="catalog-availability">Availability</label>
        <select id="catalog-availability" value={availability} onChange={(event) => resetPage(setAvailability, event.target.value)} className="form-input">
          {availabilityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <button type="button" onClick={clearFilters} className="button-secondary w-full !min-h-11">Clear filters</button>
    </>
  );

  return (
    <div className="pb-24">
      <section className="border-b border-line bg-white py-8 dark:bg-white/[.02]">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-10">
          <span className="eyebrow">{t("marketplace")}</span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{savedOnly ? t("wishlist") : "All Simba products"}</h1>
            <p className="rounded-full bg-brand/10 px-4 py-2 text-xs font-black text-brand">
              {catalogMeta.productCount} products · {catalogMeta.categoryCount} categories
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search catalog</span>
              <Search className="input-icon" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by product, brand, category, or description" className="form-input pl-11" />
              {loading && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand" />}
            </label>
            <label className="flex min-w-0 items-center gap-3 rounded-md border border-line px-4 py-2 lg:max-w-sm">
              <MapPin className="h-4 w-4 shrink-0 text-brand" />
              <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none">
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => setFiltersOpen(true)} className="button-secondary !min-h-12 lg:hidden"><Filter className="h-4 w-4" /> Filters</button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Building2 className="h-4 w-4" /> {selectedBranch.address}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[260px_1fr] lg:px-10">
        <aside className="hidden h-fit space-y-5 rounded-xl border border-line bg-canvas p-5 lg:block">{filterControls}</aside>

        <main className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <p className="text-sm text-muted"><b className="text-ink">{savedOnly ? displayedProducts.length : total}</b> {t("productsFound")}</p>
            <label className="flex min-w-[190px] items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <select value={sort} onChange={(event) => resetPage(setSort, event.target.value)} className="h-11 flex-1 rounded-md border border-line bg-canvas px-3 text-xs font-bold">
                <option value="relevance">Relevance</option>
                <option value="price-low">{t("priceLow")}</option>
                <option value="price-high">{t("priceHigh")}</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </label>
          </div>

          {error ? (
            <div role="alert" className="mt-8 rounded-xl border border-red-300 bg-red-50 p-8 text-center text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
              <h2 className="font-black">Catalog unavailable</h2>
              <p className="mt-2 text-sm">{error}</p>
              <button type="button" onClick={() => window.location.reload()} className="button-secondary mt-5">Try again</button>
            </div>
          ) : loading && !displayedProducts.length ? (
            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
              {Array.from({ length: 12 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[4/3] rounded-xl bg-black/10 dark:bg-white/10" /><div className="mt-4 h-4 rounded bg-black/10 dark:bg-white/10" /><div className="mt-2 h-4 w-2/3 rounded bg-black/10 dark:bg-white/10" /></div>)}
            </div>
          ) : displayedProducts.length ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-x-2 gap-y-7 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
                {displayedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
              {!savedOnly && pageCount > 1 && (
                <nav aria-label="Product pagination" className="mt-10 flex items-center justify-center gap-3">
                  <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="button-secondary !min-h-11 !px-4 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
                  <span className="text-sm font-bold">Page {page} of {pageCount}</span>
                  <button type="button" disabled={page >= pageCount || loading} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="button-secondary !min-h-11 !px-4 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
                </nav>
              )}
            </>
          ) : (
            <div className="py-24 text-center">
              <Search className="mx-auto h-10 w-10 text-muted" />
              <h2 className="mt-4 text-xl font-black">{savedOnly ? "Your favourites are empty" : t("noProducts")}</h2>
              <p className="mt-2 text-sm text-muted">{savedOnly ? "Save products to find them here across your devices." : t("broadenSearch")}</p>
              {!savedOnly && <button type="button" onClick={clearFilters} className="button-primary mt-6">Reset catalog</button>}
            </div>
          )}
        </main>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[100] bg-black/45 lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <div className="absolute inset-y-0 right-0 w-[min(90vw,380px)] overflow-y-auto bg-canvas p-5 shadow-2xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-black">Filters</h2><button type="button" onClick={() => setFiltersOpen(false)} className="icon-button" aria-label="Close filters"><X /></button></div>
            <div className="mt-6 space-y-5">{filterControls}</div>
            <button type="button" onClick={() => setFiltersOpen(false)} className="button-primary mt-6 w-full">Show {total} products</button>
          </div>
        </div>
      )}
    </div>
  );
}
