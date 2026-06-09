import { Suspense } from "react";
import { ShopClient } from "@/components/shop-client";

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen" />}><ShopClient /></Suspense>;
}
