"use client";

import { Bell, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { getBranchStock, Product } from "@/lib/data";
import { useStore } from "./store-provider";

export function AddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, selectedBranchId, savedProductIds, toggleSavedProduct, user } = useStore();
  const branchStock = getBranchStock(product, selectedBranchId);
  const soldOut = branchStock === 0;
  const saved = savedProductIds.includes(product.id);

  async function notifyMe() {
    if (!user) {
      window.location.href = `/signin?next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    await fetch("/api/stock-waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey: product.id }),
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[128px_1fr_auto]">
      <div className="flex h-12 items-center justify-between rounded-md border border-line px-2 sm:w-32">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="icon-button !h-8 !w-8"><Minus /></button>
        <span className="font-bold">{quantity}</span>
        <button onClick={() => setQuantity(Math.min(branchStock, quantity + 1))} className="icon-button !h-8 !w-8"><Plus /></button>
      </div>
      {soldOut ? <button type="button" onClick={() => void notifyMe()} className="button-primary flex-1"><Bell className="h-4 w-4" /> Notify Me</button> : <button type="button" onClick={() => addToCart(product, quantity)} className="button-primary flex-1"><ShoppingBag className="h-4 w-4" /> Add to Cart · {branchStock} available</button>}
      <button type="button" onClick={() => toggleSavedProduct(product.id)} className="button-secondary !px-4" aria-pressed={saved}><Heart className={`h-4 w-4 ${saved ? "fill-current text-brand" : ""}`} /><span className="sm:hidden">{saved ? "Saved" : "Wishlist"}</span></button>
    </div>
  );
}
