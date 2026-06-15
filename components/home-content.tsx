"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, MapPin, Search, ShieldCheck, ShoppingBasket, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { cleanSearchQuery } from "@/lib/product-search";
import { useStore } from "@/components/store-provider";
import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/data";
import happyShopperImage from "@/landing/happy-shopper.jpg";
import applesImage from "@/landing/pixabay-apples.jpg";
import beveragesImage from "@/landing/pixabay-beverages.jpg";
import cheeseImage from "@/landing/pixabay-cheese.jpg";
import familyShoppingImage from "@/landing/pixabay-family-shopping.jpg";
import freshGroceryImage from "@/landing/pixabay-fresh-grocery.jpg";
import marketImage from "@/landing/pixabay-market.jpg";
import produceMarketImage from "@/landing/pixabay-produce-market.jpg";
import shoppingImage from "@/landing/pixabay-shopping.jpg";
import shoppingCartImage from "@/landing/pixabay-shopping-cart.jpg";
import shoppingCartsImage from "@/landing/pixabay-shopping-carts.jpg";
import supermarketAisleImage from "@/landing/pixabay-supermarket-aisle.jpg";
import supermarketOilImage from "@/landing/pixabay-supermarket-oil.jpg";
import tangerinesImage from "@/landing/pixabay-tangerines.jpg";

type HomeCategory = {
  name: string;
  image: string;
  count: number;
  query: string;
};

const heroSlides = [
  { image: happyShopperImage, alt: "Happy customer shopping for groceries" },
  { image: supermarketAisleImage, alt: "A well-stocked supermarket aisle" },
  { image: freshGroceryImage, alt: "Fresh grocery produce display" },
  { image: produceMarketImage, alt: "Colourful supermarket produce section" },
  { image: beveragesImage, alt: "Beverages arranged on supermarket shelves" },
  { image: shoppingImage, alt: "Shopping in a supermarket aisle" },
  { image: marketImage, alt: "Fresh market products and groceries" },
  { image: applesImage, alt: "Fresh apples in the supermarket" },
  { image: shoppingCartImage, alt: "Shopping cart in front of grocery shelves" },
  { image: shoppingCartsImage, alt: "Supermarket shopping carts ready for customers" },
  { image: familyShoppingImage, alt: "Family shopping together in a supermarket" },
  { image: supermarketOilImage, alt: "Cooking oil section in a supermarket" },
  { image: tangerinesImage, alt: "Fresh tangerines in a produce display" },
  { image: cheeseImage, alt: "Cheese selection at a food market" },
];

export function HomeContent({
  categories,
  featuredProducts,
}: {
  categories: HomeCategory[];
  featuredProducts: Product[];
}) {
  const { t } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  useEffect(() => {
    if (sliderPaused) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [sliderPaused]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    const cleaned = cleanSearchQuery(input.value);
    if (!cleaned) {
      event.preventDefault();
      return;
    }
    input.value = cleaned;
  }

  return (
    <div>
      <section
        className="relative overflow-hidden bg-transparent text-ink"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
        onFocusCapture={() => setSliderPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setSliderPaused(false);
        }}
      >
        <div className="mx-auto grid max-w-[1500px] items-start gap-7 px-5 pb-8 pt-5 sm:px-8 sm:pt-6 lg:grid-cols-[1.3fr_.7fr] lg:px-8 lg:pb-10 lg:pt-7">
          <div className="mx-auto w-full max-w-[620px] sm:max-w-[700px] lg:max-w-[820px]">
            <div className="rounded-2xl bg-brand p-2 sm:p-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-brand">
                {heroSlides.map((slide, index) => (
                  <Image
                    key={slide.alt}
                    src={slide.image}
                    alt={index === activeSlide ? slide.alt : ""}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    quality={82}
                    className={`object-contain transition duration-1000 ${
                      index === activeSlide ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"
                    }`}
                    sizes="(min-width: 1024px) 52vw, (min-width: 640px) 88vw, 94vw"
                  />
                ))}
              </div>
            </div>
            <div className="mx-auto mt-4 flex w-fit justify-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-black/65" aria-label="Choose hero image">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.alt}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full border border-line transition-all ${
                    index === activeSlide ? "w-8 bg-brand" : "w-2.5 bg-muted/25 hover:bg-muted/60"
                  }`}
                  aria-label={`Show slide ${index + 1}: ${slide.alt}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                />
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-end rounded-xl border border-white/60 bg-white/85 p-4 text-ink backdrop-blur-md dark:border-white/10 dark:bg-[#151515]/85">
            <span className="inline-flex rounded-full border border-line bg-canvas px-2.5 py-1 text-[8px] font-black uppercase tracking-[.14em] text-brand">
              {t("heroEyebrow")}
            </span>
            <h1 className="mt-3 whitespace-pre-line text-xl font-black italic leading-[1.08] tracking-[-.02em] text-ink sm:text-2xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-2 text-[9px] italic leading-4 text-muted sm:text-[10px]">{t("heroText")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/shop" className="button-primary !min-h-9 !px-3 !text-[10px]">{t("startShopping")} <ArrowRight className="h-3 w-3" /></Link>
              <Link href="/shop?category=Simba%20Favourites" className="button-secondary !min-h-9 !px-3 !text-[10px]">{t("seeFavourites")}</Link>
            </div>
            <Link href="/signin" className="mt-2 inline-flex min-h-9 items-center justify-center rounded-md border border-brand px-4 text-[10px] font-black text-brand transition hover:bg-brand hover:text-white">
              {t("signin")}
            </Link>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3">
              {[
                ["789", t("productsReady")],
                ["30-45", t("deliveryMinutes")],
                ["9", t("marketBranches")],
              ].map(([value, label]) => (
                <div key={String(label)}>
                  <p className="text-base font-black sm:text-lg">{value}</p>
                  <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[.08em] text-muted sm:text-[8px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 text-ink sm:px-8 lg:px-10">
        <form onSubmit={submitSearch} action="/shop" className="mb-8 flex w-full max-w-3xl overflow-hidden rounded-xl border border-line bg-canvas p-1.5 text-ink">
          <Search className="ml-3 mt-3 h-4 w-4 shrink-0 text-brand" />
          <input name="q" className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none" placeholder={t("search")} />
          <button className="rounded-lg bg-brand px-4 text-xs font-black text-white sm:px-6">{t("searchProducts")}</button>
        </form>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("shopCategories")}</span>
            <h2 className="section-title mt-2">{t("shopCategories")}</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-sm font-black text-brand">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
          {categories.map((category) => (
            <Link href={`/shop?category=${encodeURIComponent(category.query)}`} key={category.name} className="group rounded-lg border border-line bg-canvas p-2 transition hover:border-brand">
              <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                <ProductImage src={category.image} alt={category.name} fill className="object-contain p-2 transition duration-300 group-hover:scale-105" sizes="180px" />
              </div>
              <p className="px-1 pt-3 text-sm font-black">{category.name}</p>
              <p className="px-1 pb-2 pt-1 text-[10px] text-muted">{category.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-14 text-ink dark:bg-white/[.02]">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">{t("featuredTitle")}</span>
              <h2 className="section-title mt-2">{t("featuredTitle")}</h2>
              <p className="mt-2 text-sm text-muted">{t("featuredText")}</p>
            </div>
            <Link href="/shop" className="hidden items-center gap-2 text-sm font-black text-brand sm:flex">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 text-ink sm:px-8 lg:px-10">
        <div className="grid overflow-hidden rounded-xl border border-line bg-canvas lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative min-h-[360px]">
            <Image src="/images/4.jpg" alt="Fresh market products" fill className="object-cover" sizes="50vw" />
          </div>
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="eyebrow">{t("whySimba")}</span>
            <h2 className="section-title mt-3">{t("whySimba")}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                [ShieldCheck, t("secureCheckout"), "Protected account and checkout flows."],
                [Truck, t("reliableDelivery"), "Clear status from branch to doorstep."],
                [MapPin, t("branchStock"), "Availability follows your selected branch."],
                [Headphones, t("realSupport"), "Customer help and conversational search."],
              ].map(([Icon, title, text]) => (
                <div key={String(title)} className="border-t border-line pt-5">
                  <Icon className="h-6 w-6 text-brand" />
                  <h3 className="mt-3 font-black">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{String(text)}</p>
                </div>
              ))}
            </div>
            <Link href="/shop" className="button-primary mt-8"><ShoppingBasket className="h-4 w-4" /> {t("startShopping")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
