"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { getBranchStock, Product } from "@/lib/data";
import { useStore } from "./store-provider";

export function AddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, selectedBranchId } = useStore();
  const branchStock = getBranchStock(product, selectedBranchId);
  const soldOut = branchStock === 0;
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex h-12 items-center justify-between rounded-md border border-line px-2 sm:w-32">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="icon-button !h-8 !w-8"><Minus /></button>
        <span className="font-bold">{quantity}</span>
        <button onClick={() => setQuantity(Math.min(branchStock, quantity + 1))} className="icon-button !h-8 !w-8"><Plus /></button>
      </div>
      <button disabled={soldOut} onClick={() => addToCart(product, quantity)} className="button-primary flex-1 disabled:cursor-not-allowed disabled:bg-[#777]"><ShoppingBag className="h-4 w-4" /> {soldOut ? "Unavailable at this branch" : `Add to basket - ${branchStock} available`}</button>
    </div>
  );
}
