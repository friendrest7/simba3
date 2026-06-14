import { Suspense } from "react";
import { ShopClient } from "@/components/shop-client";

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen animate-pulse bg-black/[.03]" aria-label="Loading catalog" />}><ShopClient /></Suspense>;
}
