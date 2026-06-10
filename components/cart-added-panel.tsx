"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "./store-provider";

export function CartAddedPanel() {
  const { cartCount, cartPanelOpen, closeCartPanel, recentAdds } = useStore();
  const latest = recentAdds[0];

  useEffect(() => {
    if (!cartPanelOpen) return;
    const timeout = window.setTimeout(closeCartPanel, 2_600);
    return () => window.clearTimeout(timeout);
  }, [cartPanelOpen, closeCartPanel, latest?.quantity]);

  if (!cartPanelOpen || !latest) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-4 z-[90] flex justify-center sm:inset-x-auto sm:bottom-6 sm:right-6">
      <div role="status" aria-live="polite" className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/20 bg-[#17181b]/95 p-3 text-white shadow-[0_18px_50px_rgba(0,0,0,.28)] backdrop-blur-xl">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#16865c]"><Check className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Added successfully</p>
          <p className="mt-0.5 truncate text-[11px] text-white/65">{latest.product.name} - {cartCount} {cartCount === 1 ? "item" : "items"} in basket</p>
        </div>
        <button onClick={closeCartPanel} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white" title="Dismiss message"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
