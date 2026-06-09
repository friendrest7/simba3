"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { Price } from "@/components/price";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const delivery = subtotal >= 40 || subtotal === 0 ? 0 : 5.9;

  return (
    <div className="mx-auto min-h-[70vh] max-w-[1200px] px-5 py-12 sm:px-8">
      <span className="eyebrow">Your basket</span><h1 className="mt-3 text-4xl font-black tracking-tight">Cart <span className="text-muted">({cart.length})</span></h1>
      {!cart.length ? <div className="py-24 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-muted" /><h2 className="mt-5 text-2xl font-black">Your basket is waiting</h2><p className="mt-2 text-muted">Explore fresh products and global market finds.</p><Link href="/shop" className="button-primary mt-6">Start shopping <ArrowRight className="h-4 w-4" /></Link></div> :
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line border-y border-line">
          {cart.map(({ product, quantity }) => <div key={product.id} className="grid grid-cols-[100px_1fr] gap-4 py-5 sm:grid-cols-[130px_1fr_auto]">
            <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden rounded-lg border border-line bg-white"><Image src={product.image} alt={product.name} fill className={product.category.includes("Simba") || product.image.endsWith(".svg") || product.image.includes("product-") ? "object-contain p-3" : "object-cover"} sizes="130px" /></Link>
            <div className="min-w-0 py-1"><p className="text-[10px] font-black uppercase text-muted">{product.category}</p><Link href={`/products/${product.id}`} className="mt-1 block font-black">{product.name}</Link><p className="mt-2 text-xs text-muted">{product.unit} · {product.seller}</p><button onClick={() => removeFromCart(product.id)} className="mt-4 flex items-center gap-1 text-xs font-bold text-brand"><Trash2 className="h-3.5 w-3.5" /> Remove</button></div>
            <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end">
              <Price value={product.price * quantity} className="font-black" />
              <div className="flex h-10 items-center rounded-md border border-line px-1"><button onClick={() => updateQuantity(product.id, quantity - 1)} className="icon-button !h-8 !w-8"><Minus /></button><span className="w-7 text-center text-sm font-bold">{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} className="icon-button !h-8 !w-8"><Plus /></button></div>
            </div>
          </div>)}
        </div>
        <aside className="h-fit rounded-xl border border-line bg-canvas p-6 shadow-[0_14px_35px_rgba(0,0,0,.06)]"><h2 className="text-lg font-black">Order summary</h2><div className="mt-6 space-y-4 text-sm"><div className="flex justify-between text-muted"><span>Subtotal</span><Price value={subtotal} /></div><div className="flex justify-between text-muted"><span>Delivery</span>{delivery ? <Price value={delivery} /> : <span>Free</span>}</div><div className="flex justify-between border-t border-line pt-5 text-lg font-black"><span>Total</span><Price value={subtotal + delivery} /></div></div>{subtotal < 40 && <p className="mt-4 text-xs text-muted">Add <Price value={40 - subtotal} /> more for free delivery.</p>}<Link href="/checkout" className="button-primary mt-6 w-full">Secure checkout <ArrowRight className="h-4 w-4" /></Link><Link href="/shop" className="mt-4 block text-center text-xs font-bold text-muted hover:text-brand">Continue shopping</Link></aside>
      </div>}
    </div>
  );
}
