"use client";

import Link from "next/link";
import { Eye, Heart, Minus, Plus, Star, X } from "lucide-react";
import { getBranchStock, getStockStatus, Product } from "@/lib/data";
import { useStore } from "./store-provider";
import { Price } from "./price";
import { ProductImage } from "./product-image";
import { useState } from "react";

function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, cart, selectedBranchId, updateQuantity } = useStore();
  const branchStock = getBranchStock(product, selectedBranchId);
  const soldOut = branchStock === 0;
  const quantity = cart.find((item) => item.product.id === product.id)?.quantity || 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Quick view: ${product.name}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#1b1c20]">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/10 text-ink hover:bg-black/20 dark:bg-white/10" aria-label="Close quick view"><X className="h-4 w-4" /></button>
        <div className="grid sm:grid-cols-2">
          <div className="relative aspect-square bg-[#f2f2f0]">
            <ProductImage src={product.image} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 640px) 100vw, 50vw" />
            {product.badge && <span className="absolute left-3 top-3 rounded-sm bg-white px-2.5 py-1 text-[10px] font-black uppercase text-ink shadow-sm dark:bg-[#202126]">{product.badge}</span>}
          </div>
          <div className="flex flex-col p-6">
            <p className="text-[10px] font-black uppercase text-muted">{product.category}{product.subcategory ? ` · ${product.subcategory}` : ""}</p>
            <h2 className="mt-2 text-xl font-black leading-snug">{product.name}</h2>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-muted">({product.reviews} reviews)</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <Price value={product.price} className="text-2xl font-black" />
              {product.oldPrice && <Price value={product.oldPrice} className="pb-0.5 text-sm text-muted line-through" />}
              <span className="pb-0.5 text-xs text-muted">/ {product.unit}</span>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{product.description}</p>
            <p className={`mt-3 text-xs font-bold ${soldOut ? "text-[#d94b1b]" : branchStock < 10 ? "text-amber-600" : "text-[#16865c]"}`}>
              {soldOut ? "Out of stock" : `${branchStock} in stock`}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {quantity > 0 ? (
                <div className="flex h-11 items-center rounded-lg bg-brand text-white shadow-sm">
                  <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-11 w-11 place-items-center rounded-l-lg hover:bg-black/10"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                  <button type="button" disabled={quantity >= branchStock} onClick={() => addToCart(product)} className="grid h-11 w-11 place-items-center rounded-r-lg hover:bg-black/10 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <button type="button" disabled={soldOut} onClick={() => addToCart(product)} className="button-primary !min-h-11 flex-1 disabled:opacity-50"><Plus className="h-4 w-4" /> Add to cart</button>
              )}
            </div>
            <Link href={`/products/${product.id}`} onClick={onClose} className="mt-3 text-center text-xs font-bold text-brand hover:underline">View full details →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart, selectedBranchId, savedProductIds, toggleSavedProduct, updateQuantity, t } = useStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const branchStock = getBranchStock(product, selectedBranchId);
  const soldOut = branchStock === 0;
  const stockStatus = getStockStatus({ ...product, stock: branchStock });
  const saved = savedProductIds.includes(product.id);
  const quantity = cart.find((item) => item.product.id === product.id)?.quantity || 0;
  const containedImage = product.id.startsWith("catalog-") || product.category.includes("Simba") || product.image.endsWith(".svg") || product.image.includes("product-");
  const productHref = product.managerCreated ? `/shop?q=${encodeURIComponent(product.name)}` : `/products/${product.id}`;
  return (
    <>
      <article className={`group min-w-0 rounded-xl border border-transparent p-2 transition duration-300 hover:-translate-y-1 hover:border-line hover:bg-canvas hover:shadow-[0_14px_35px_rgba(0,0,0,.08)] ${soldOut ? "opacity-75" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f2f2f0]">
          <Link href={productHref} className="relative block h-full">
            <ProductImage src={product.image} alt={product.name} fill className={`transition duration-500 group-hover:scale-[1.035] ${containedImage ? "object-contain p-4" : "object-cover"}`} sizes="(max-width: 768px) 50vw, 25vw" />
          </Link>
          {product.badge && <span className="absolute left-3 top-3 rounded-sm bg-white px-2.5 py-1 text-[10px] font-black uppercase text-ink shadow-sm dark:bg-[#202126] dark:text-white">{product.badge}</span>}
          <span className={`absolute bottom-3 left-3 rounded-sm px-2.5 py-1 text-[10px] font-black uppercase text-white ${soldOut ? "bg-[#555]" : stockStatus === "low-stock" ? "bg-amber-600" : "bg-[#16865c]"}`}>{soldOut ? t("unavailableHere") : stockStatus === "low-stock" ? `Low stock: ${branchStock}` : `${branchStock} ${t("inStock")}`}</span>
          {/* Quick View button */}
          {!product.managerCreated && (
            <button type="button" onClick={() => setQuickViewOpen(true)} className="absolute bottom-3 right-3 flex h-8 items-center gap-1.5 rounded-sm bg-white/95 px-2.5 text-[10px] font-black text-ink shadow-sm opacity-0 transition hover:scale-105 group-hover:opacity-100 focus-visible:opacity-100 dark:bg-[#202126] dark:text-white" aria-label={`Quick view ${product.name}`}><Eye className="h-3.5 w-3.5" /> Quick view</button>
          )}
          <button type="button" onClick={() => toggleSavedProduct(product.id)} className={`absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[#171719] shadow-sm transition hover:scale-105 focus-visible:opacity-100 ${saved ? "text-brand opacity-100" : "opacity-90 sm:opacity-0 sm:group-hover:opacity-100"}`} title={saved ? t("removeSaved") : t("saveProduct")} aria-pressed={saved}><Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /></button>
        </div>
        <div className="pt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase text-muted">{product.category}</span>
            <span className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating}</span>
          </div>
          <Link href={productHref} className="line-clamp-2 min-h-10 font-bold leading-5 text-ink hover:text-brand">{product.name}</Link>
          <p className="mt-1 truncate text-xs text-muted">{product.subcategory ? `${product.subcategory} · ` : ""}{t("by")} {product.brand || product.seller}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div><Price value={product.price} className="font-black text-ink" />{product.oldPrice && <Price value={product.oldPrice} className="ml-2 text-xs text-muted line-through" />}</div>
            {quantity > 0 ? (
              <div className="flex h-11 shrink-0 items-center rounded-lg bg-brand text-white shadow-sm">
                <button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} className="grid h-11 w-11 place-items-center rounded-l-lg transition hover:bg-black/10" title="Reduce quantity"><Minus className="h-3.5 w-3.5" /></button>
                <span className="min-w-7 text-center text-xs font-black">{quantity}</span>
                <button type="button" disabled={quantity >= branchStock} onClick={() => addToCart(product)} className="grid h-11 w-11 place-items-center rounded-r-lg transition hover:bg-black/10 disabled:opacity-45" title="Add another"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button type="button" disabled={soldOut} onClick={() => addToCart(product)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#777]" title={soldOut ? t("soldOut") : t("addToCart")}><Plus className="h-4 w-4" /></button>
            )}
          </div>
        </div>
      </article>
      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
}
