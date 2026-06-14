"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useStore } from "./store-provider";

export function MobileCartBar() {
  const pathname = usePathname();
  const { cart, cartCount } = useStore();
  if (!cartCount || pathname === "/cart" || pathname === "/checkout") return null;
  const totalRwf = cart.reduce((sum, item) => sum + Math.round(item.product.price * 1450) * item.quantity, 0);
  return <Link href="/cart" className="fixed bottom-3 left-3 right-3 z-[80] flex min-h-14 items-center justify-between rounded-xl bg-brand px-5 text-sm font-black text-white shadow-2xl md:hidden"><span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> View cart ({cartCount})</span><span>FRw {totalRwf.toLocaleString()}</span></Link>;
}
