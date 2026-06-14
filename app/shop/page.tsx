import { Suspense } from "react";
import { ShopClient } from "@/components/shop-client";
import { allProductCategories, allProducts, allProductSubcategories } from "@/lib/catalog-products";

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen animate-pulse bg-black/[.03]" aria-label="Loading catalog" />}>
    <ShopClient
      initialProducts={allProducts.slice(0, 24)}
      initialCategories={allProductCategories}
      initialSubcategories={allProductSubcategories}
      initialTotal={allProducts.length}
      initialPageCount={Math.ceil(allProducts.length / 24)}
    />
  </Suspense>;
}
