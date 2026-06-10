"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Star } from "lucide-react";
import { getBranchStock, Product } from "@/lib/data";
import { useStore } from "./store-provider";
import { Price } from "./price";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, selectedBranchId, savedProductIds, toggleSavedProduct, updateQuantity } = useStore();
  const branchStock = getBranchStock(product, selectedBranchId);
  const soldOut = branchStock === 0;
  const saved = savedProductIds.includes(product.id);
  const quantity = cart.find((item) => item.product.id === product.id)?.quantity || 0;
  const containedImage = product.id.startsWith("catalog-") || product.category.includes("Simba") || product.image.endsWith(".svg") || product.image.includes("product-");
  const productHref = product.managerCreated ? `/shop?q=${encodeURIComponent(product.name)}` : `/products/${product.id}`;
  return (
    <article className={`group min-w-0 rounded-xl border border-transparent p-2 transition duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas hover:shadow-[0_14px_35px_rgba(0,0,0,.08)] ${soldOut ? "opacity-75" : ""}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f2f2f0]">
        <Link href={productHref} className="relative block h-full">
          <Image src={product.image} alt={product.name} fill className={`transition duration-500 group-hover:scale-[1.035] ${containedImage ? "object-contain p-4" : "object-cover"}`} sizes="(max-width: 768px) 50vw, 25vw" />
        </Link>
        {product.badge && <span className="absolute left-3 top-3 rounded-sm bg-white px-2.5 py-1 text-[10px] font-black uppercase text-ink shadow-sm dark:bg-[#202126] dark:text-white">{product.badge}</span>}
        <span className={`absolute bottom-3 left-3 rounded-sm px-2.5 py-1 text-[10px] font-black uppercase text-white ${soldOut ? "bg-[#555]" : "bg-[#16865c]"}`}>{soldOut ? "Unavailable here" : `${branchStock} at branch`}</span>
        <button type="button" onClick={() => toggleSavedProduct(product.id)} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 focus-visible:opacity-100 ${saved ? "text-brand opacity-100" : "text-ink opacity-80 sm:opacity-0 sm:group-hover:opacity-100"}`} title={saved ? "Remove from saved products" : "Save product"} aria-pressed={saved}><Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /></button>
      </div>
      <div className="pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase text-muted">{product.category}</span>
          <span className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating}</span>
        </div>
        <Link href={productHref} className="line-clamp-2 min-h-10 font-bold leading-5 text-ink hover:text-brand">{product.name}</Link>
        <p className="mt-1 text-xs text-muted">by {product.seller}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div><Price value={product.price} className="font-black text-ink" />{product.oldPrice && <Price value={product.oldPrice} className="ml-2 text-xs text-muted line-through" />}</div>
          {quantity > 0 ? (
            <div className="flex h-10 shrink-0 items-center rounded-lg bg-brand text-white shadow-sm">
              <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-10 w-9 place-items-center rounded-l-lg transition hover:bg-black/10" title="Reduce quantity"><Minus className="h-3.5 w-3.5" /></button>
              <span className="min-w-7 text-center text-xs font-black">{quantity}</span>
              <button type="button" disabled={quantity >= branchStock} onClick={() => addToCart(product)} className="grid h-10 w-9 place-items-center rounded-r-lg transition hover:bg-black/10 disabled:opacity-45" title="Add another"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button type="button" disabled={soldOut} onClick={() => addToCart(product)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#777]" title={soldOut ? "Sold out" : "Add to cart"}><Plus className="h-4 w-4" /></button>
          )}
        </div>
      </div>
    </article>
  );
}
