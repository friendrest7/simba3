import { Suspense } from "react";
import { ShopClient } from "@/components/shop-client";
import { allProductCategories, allProducts, allProductSubcategories } from "@/lib/catalog-products";

export default function ShopPage() {
  return <>
    <section className="border-b border-line bg-brand/5 px-4 py-4 text-xs sm:px-8" aria-label="Catalog search and filter capabilities">
      <div className="mx-auto flex max-w-[1500px] flex-wrap gap-x-6 gap-y-2">
        <strong>789 products · 11 categories · 98 subcategories</strong>
        <span>Instant full-text search: name, description, brand, category</span>
        <span>Filters: Category · Subcategory · Price range (RWF) · In Stock · Low Stock · Out of Stock</span>
        <span>Sort: Relevance · Price Low to High · Price High to Low · Name A-Z · Name Z-A</span>
        <span>Pagination: 24 products per page</span>
      </div>
    </section>
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-black/[.03]" aria-label="Loading catalog" />}>
      <ShopClient
        initialProducts={allProducts.slice(0, 24)}
        initialCategories={allProductCategories}
        initialSubcategories={allProductSubcategories}
        initialTotal={allProducts.length}
        initialPageCount={Math.ceil(allProducts.length / 24)}
      />
    </Suspense>
  </>;
}
