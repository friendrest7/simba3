"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, X } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useStore } from "./store-provider";

export function CartAddedPanel() {
  const { cart, cartCount, cartPanelOpen, closeCartPanel, currency, recentAdds } = useStore();
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!cartPanelOpen || !recentAdds.length) return null;

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <button
        aria-label="Close cart confirmation"
        onClick={closeCartPanel}
        className="pointer-events-auto absolute inset-0 hidden bg-black/25 backdrop-blur-[2px] sm:block"
      />
      <aside className="pointer-events-auto absolute inset-x-3 bottom-3 overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[410px]">
        <header className="flex items-center justify-between bg-[#16865c] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20"><Check className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-black">Added successfully</p>
              <p className="text-[11px] text-white/75">{cartCount} {cartCount === 1 ? "item" : "items"} in your basket</p>
            </div>
          </div>
          <button onClick={closeCartPanel} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" title="Keep shopping"><X className="h-4 w-4" /></button>
        </header>

        <div className="max-h-[310px] space-y-2 overflow-y-auto p-4">
          {recentAdds.map(({ product, quantity }) => (
            <div key={product.id} className="grid grid-cols-[62px_1fr_auto] items-center gap-3 rounded-xl border border-line bg-white/60 p-2 dark:bg-white/[.04]">
              <span className="relative block h-[62px] overflow-hidden rounded-lg bg-white">
                <Image src={product.image} alt={product.name} fill className={product.category === "Simba Favourites" ? "object-contain p-1" : "object-cover"} sizes="62px" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 block text-xs font-black">{product.name}</span>
                <span className="mt-1 block text-[10px] text-muted">{product.unit}</span>
              </span>
              <span className="text-right">
                <span className="block rounded-full bg-[#16865c]/10 px-2 py-1 text-[10px] font-black text-[#16865c]">x{quantity}</span>
                <span className="mt-1 block text-xs font-black">{formatPrice(product.price * quantity, currency)}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-muted">Basket total</span>
            <span className="text-lg font-black">{formatPrice(total, currency)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={closeCartPanel} className="button-secondary !min-h-11 !px-3">Keep shopping</button>
            <Link href="/cart" onClick={closeCartPanel} className="button-primary !min-h-11 !px-3">
              <ShoppingBag className="h-4 w-4" /> View cart <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
