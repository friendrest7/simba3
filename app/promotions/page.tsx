import Link from "next/link";
import { ArrowRight, BadgePercent, Clock3, Sparkles } from "lucide-react";
import { FlashSaleCountdown } from "@/components/flash-sale-countdown";
import { ProductCard } from "@/components/product-card";
import { allProducts } from "@/lib/catalog-products";

export default function PromotionsPage() {
  const deals = allProducts.slice(40, 52).map((product, index) => ({
    ...product,
    oldPrice: Number((product.price * (1.12 + (index % 4) * 0.04)).toFixed(2)),
    badge: `${12 + (index % 4) * 4}% off`,
  }));
  return (
    <div className="pb-20">
      <section className="bg-[#171719] px-4 py-16 text-white">
        <div className="mx-auto max-w-[1400px]">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-amber-400"><Sparkles className="h-4 w-4" /> Simba promotions</span>
          <div className="mt-5 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div><h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Featured deals across the Simba catalog.</h1><p className="mt-4 max-w-xl leading-7 text-white/65">Limited discounts on everyday essentials, home products, drinks, and personal care.</p></div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-5"><p className="flex items-center gap-2 text-xs font-black uppercase text-white/60"><Clock3 className="h-4 w-4" /> Flash sale ends in</p><div className="mt-3"><FlashSaleCountdown /></div></div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <div className="grid gap-4 md:grid-cols-3">{[["Up to 24% off", "Daily essentials"], ["Free delivery", "Orders over FRw 60,000"], ["789 products", "Every catalog category"]].map(([title, text]) => <div key={title} className="rounded-xl border border-line p-5"><BadgePercent className="h-6 w-6 text-brand" /><h2 className="mt-4 text-xl font-black">{title}</h2><p className="mt-1 text-sm text-muted">{text}</p></div>)}</div>
        <div className="mt-12 flex items-end justify-between gap-4"><div><span className="eyebrow">Flash sale</span><h2 className="mt-2 text-3xl font-black">Today&apos;s featured deals</h2></div><Link href="/shop" className="hidden items-center gap-2 text-sm font-black text-brand sm:flex">Shop all 789 products <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-7 grid grid-cols-2 gap-x-2 gap-y-8 md:grid-cols-3 lg:grid-cols-4">{deals.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
    </div>
  );
}
