"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { allProducts } from "@/lib/catalog-products";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, saveForLater, savedForLater, moveToCart, removeFromSaved, t } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  // Prevent empty-cart flash before localStorage hydrates on client
  const [mounted] = useState(() => typeof window !== "undefined");

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal >= 40 || subtotal === 0 ? 0 : 5.9;
  const cartIds = new Set(cart.map((item) => item.product.id));
  const cartCategories = new Set(cart.map((item) => item.product.category));
  const recommendations = allProducts
    .filter((product) => !cartIds.has(product.id))
    .sort((a, b) => Number(cartCategories.has(b.category)) - Number(cartCategories.has(a.category)) || b.rating - a.rating)
    .slice(0, 4);

  if (!mounted) {
    return (
      <div className="mx-auto min-h-[70vh] max-w-[1200px] px-5 py-12 sm:px-8">
        <div className="h-6 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-3 h-10 w-48 animate-pulse rounded bg-black/10 dark:bg-white/10" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-[130px_1fr] gap-4 py-5 border-b border-line">
                <div className="aspect-square animate-pulse rounded-lg bg-black/10 dark:bg-white/10" />
                <div className="space-y-3 py-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                  <div className="h-5 w-48 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                  <div className="h-3 w-32 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-[1200px] px-5 py-12 sm:px-8">
      <span className="eyebrow">{t("basketTitle")}</span>
      <h1 className="mt-3 text-4xl font-black tracking-tight">{t("cart")} <span className="text-muted">({cart.length})</span></h1>

      {!cart.length ? (
        <div className="py-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted" />
          <h2 className="mt-5 text-2xl font-black">{t("basketEmpty")}</h2>
          <p className="mt-2 text-muted">{t("basketEmptyText")}</p>
          <Link href="/shop" className="button-primary mt-6">{t("startShopping")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-line border-y border-line">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="grid grid-cols-[100px_1fr] gap-4 py-5 sm:grid-cols-[130px_1fr_auto]">
                <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
                  <ProductImage src={product.image} alt={product.name} fill className="object-contain p-3" sizes="130px" />
                </Link>
                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-black uppercase text-muted">{product.category}</p>
                  <Link href={`/products/${product.id}`} className="mt-1 block font-black">{product.name}</Link>
                  <p className="mt-2 text-xs text-muted">{product.unit} &middot; {product.seller}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => removeFromCart(product.id)} className="flex items-center gap-1 text-xs font-bold text-brand">
                      <Trash2 className="h-3.5 w-3.5" /> {t("remove")}
                    </button>
                    <span className="text-line">|</span>
                    <button onClick={() => saveForLater(product.id)} className="flex items-center gap-1 text-xs font-bold text-muted hover:text-brand">
                      <Bookmark className="h-3.5 w-3.5" /> Save for later
                    </button>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end">
                  <Price value={product.price * quantity} className="font-black" />
                  <div className="flex h-10 items-center rounded-md border border-line px-1">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="icon-button !h-8 !w-8"><Minus /></button>
                    <span className="w-7 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="icon-button !h-8 !w-8"><Plus /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-xl border border-line bg-canvas p-6 shadow-[0_14px_35px_rgba(0,0,0,.06)]">
            <h2 className="text-lg font-black">{t("orderSummary")}</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-muted"><span>{t("subtotal")}</span><Price value={subtotal} /></div>
              <div className="flex justify-between text-muted"><span>{t("delivery")}</span>{delivery ? <Price value={delivery} /> : <span>{t("free")}</span>}</div>
              <div className="flex justify-between border-t border-line pt-5 text-lg font-black"><span>{t("total")}</span><Price value={subtotal + delivery} /></div>
            </div>
            <Link href="/checkout" className="button-primary mt-6 w-full">{t("checkout")} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/shop" className="mt-4 block text-center text-xs font-bold text-muted hover:text-brand">{t("continueShopping")}</Link>
            {confirmClear ? (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs dark:bg-red-950/30">
                <span className="font-semibold text-red-700 dark:text-red-400">Clear entire basket?</span>
                <div className="flex gap-2">
                  <button onClick={() => { clearCart(); setConfirmClear(false); }} className="rounded-md bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700">Yes</button>
                  <button onClick={() => setConfirmClear(false)} className="rounded-md bg-muted/10 px-2.5 py-1 font-bold text-muted hover:bg-muted/20">No</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmClear(true)} className="mt-4 block w-full text-center text-xs font-bold text-muted hover:text-brand">
                Clear cart
              </button>
            )}
          </aside>
        </div>
      )}

      {/* Saved for Later shelf */}
      {savedForLater.length > 0 && (
        <section className="mt-14 border-t border-line pt-10">
          <div className="flex items-center gap-3">
            <BookmarkCheck className="h-5 w-5 text-brand" />
            <h2 className="text-2xl font-black">Saved for later <span className="text-muted">({savedForLater.length})</span></h2>
          </div>
          <p className="mt-1 text-sm text-muted">Items you moved out of your cart. Move them back any time.</p>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {savedForLater.map(({ product, quantity }) => (
              <div key={product.id} className="grid grid-cols-[80px_1fr] gap-4 py-5 sm:grid-cols-[100px_1fr_auto]">
                <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white">
                  <ProductImage src={product.image} alt={product.name} fill className="object-contain p-2" sizes="100px" />
                </Link>
                <div className="min-w-0 py-1">
                  <p className="text-[10px] font-black uppercase text-muted">{product.category}</p>
                  <Link href={`/products/${product.id}`} className="mt-1 block font-black">{product.name}</Link>
                  <p className="mt-1 text-xs text-muted">{product.unit}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => moveToCart(product.id)} className="flex items-center gap-1 text-xs font-bold text-brand hover:opacity-80">
                      <ShoppingBag className="h-3.5 w-3.5" /> Move to cart
                    </button>
                    <span className="text-line">|</span>
                    <button onClick={() => removeFromSaved(product.id)} className="flex items-center gap-1 text-xs font-bold text-muted hover:text-brand">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex sm:flex-col sm:items-end sm:justify-center">
                  <Price value={product.price * quantity} className="font-black" />
                  <p className="mt-1 text-xs text-muted">qty: {quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!cart.length && <section className="mt-16 border-t border-line pt-10"><span className="eyebrow">Complete your basket</span><h2 className="mt-2 text-2xl font-black">Recommended for your cart</h2><p className="mt-2 text-sm text-muted">Suggestions update from the categories already in your basket.</p><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{recommendations.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
    </div>
  );
}
