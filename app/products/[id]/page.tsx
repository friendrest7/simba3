import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, MapPin, RotateCcw, Share2, ShieldCheck, Star, Truck } from "lucide-react";
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
  const productUrl = `https://simba3-ashy.vercel.app/products/${product.id}`;
  const shareText = encodeURIComponent(`Check out ${product.name} on Simba Supermarket Rwanda!`);
  const shareUrl = encodeURIComponent(productUrl);

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

          {/* Social sharing */}
          <div className="mt-6 border-t border-line pt-5">
            <p className="flex items-center gap-2 text-xs font-black text-muted"><Share2 className="h-4 w-4" /> Share this product</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-bold transition hover:border-[#25d366] hover:text-[#25d366]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                WhatsApp
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-bold transition hover:border-[#1877f2] hover:text-[#1877f2]">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-bold transition hover:border-[#000] hover:text-[#000] dark:hover:border-white dark:hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.254 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" /></svg>
                X / Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
      <ProductReviews productKey={product.id} />
      {related.length > 0 && <section className="py-14"><h2 className="section-title">More from this aisle</h2><div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4">{related.map((item) => <div key={item.id} className="w-[70vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]"><ProductCard product={item} /></div>)}</div></section>}
    </div>
  );
}
