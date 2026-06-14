import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, MapPin, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { allProducts } from "@/lib/catalog-products";
import { Price } from "@/components/price";
import { BranchAvailability } from "@/components/branch-availability";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviews } from "@/components/product-reviews";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = allProducts.find((item) => item.id === id);
  if (!product) notFound();
  const soldOut = product.availability === "sold-out" || product.stock === 0;
  const related = allProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex items-center gap-2 text-xs text-muted"><Link href="/shop">Marketplace</Link><ChevronRight className="h-3 w-3" /><span>{product.category}</span><ChevronRight className="h-3 w-3" /><span className="text-ink">{product.name}</span></div>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
        <ProductGallery image={product.image} name={product.name} />
        <div className="flex flex-col justify-center">
          {product.badge && <span className="eyebrow">{product.badge}</span>}
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="flex items-center gap-1 font-bold"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {product.rating}</span><span className="text-muted">{product.reviews} reviews</span><span className="h-1 w-1 rounded-full bg-line" /><span className={soldOut ? "font-bold text-[#d94b1b]" : "font-bold text-[#16865c]"}>{soldOut ? "Sold out" : `${product.stock} available`}</span></div>
          <div className="mt-7 flex items-end gap-3"><Price value={product.price} className="text-3xl font-black" />{product.oldPrice && <Price value={product.oldPrice} className="pb-1 text-sm text-muted line-through" />}<span className="pb-1 text-xs text-muted">/ {product.unit}</span></div>
          <p className="mt-6 border-y border-line py-6 leading-7 text-muted">{product.description}</p>
          <div className="my-6 flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-md bg-brand/10 text-brand"><BadgeCheck className="h-5 w-5" /></span><div><p className="text-sm font-black">{product.seller}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {product.location} · Verified seller</p></div></div>
          <AddToCart product={product} />
          <BranchAvailability product={product} />
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-6 text-center text-[11px] font-bold text-muted"><span><Truck className="mx-auto mb-2 h-5 w-5 text-ink" />Fast delivery</span><span><ShieldCheck className="mx-auto mb-2 h-5 w-5 text-ink" />Secure payment</span><span><RotateCcw className="mx-auto mb-2 h-5 w-5 text-ink" />Easy returns</span></div>
        </div>
      </div>
      <ProductReviews productKey={product.id} />
      {related.length > 0 && <section className="py-14"><h2 className="section-title">More from this aisle</h2><div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">{related.map((item) => <div key={item.id} className="w-[70vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]"><ProductCard product={item} /></div>)}</div></section>}
    </div>
  );
}
