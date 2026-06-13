"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, MapPin, Search, ShieldCheck, ShoppingBasket, Truck } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/data";
import { cleanSearchQuery } from "@/lib/product-search";
import { useStore } from "@/components/store-provider";

export default function Home() {
  const { t } = useStore();
  const [videoFailed, setVideoFailed] = useState(false);
  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

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
      <section className="relative min-h-[620px] overflow-hidden bg-[#151515] text-white">
        <Image
          src="/images/hero_image.png"
          alt="Simba Supermarket"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {videoUrl && !videoFailed && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero_image.png"
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,.82),rgba(10,10,10,.45)_58%,rgba(10,10,10,.22))]" />
        <div className="relative mx-auto flex min-h-[620px] max-w-[1500px] items-center px-5 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/25 bg-black/20 px-4 py-2 text-[11px] font-black uppercase tracking-[.18em]">
              {t("heroEyebrow")}
            </span>
            <h1 className="mt-6 max-w-3xl whitespace-pre-line text-5xl font-black leading-[.98] tracking-[-.04em] sm:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{t("heroText")}</p>
            <form onSubmit={submitSearch} action="/shop" className="mt-8 flex max-w-2xl overflow-hidden rounded-lg bg-white p-1.5 text-[#171719] shadow-2xl">
              <Search className="ml-4 mt-3.5 h-5 w-5 shrink-0 text-brand" />
              <input name="q" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none" placeholder={t("search")} />
              <button className="rounded-md bg-brand px-5 text-sm font-black text-white">{t("searchProducts")}</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="button-primary">{t("startShopping")} <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/shop?category=Simba%20Favourites" className="button-secondary !border-white/40 !bg-white/10 !text-white">{t("seeFavourites")}</Link>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/20 pt-6">
              {[
                ["16+", t("productsReady")],
                ["30-45", t("deliveryMinutes")],
                ["8", t("marketBranches")],
              ].map(([value, label]) => (
                <div key={String(label)}>
                  <p className="text-2xl font-black sm:text-3xl">{value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[.12em] text-white/65 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">{t("shopCategories")}</span>
            <h2 className="section-title mt-2">{t("shopCategories")}</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-sm font-black text-brand">{t("viewAll")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.slice(0, 8).map((category) => (
            <Link href={`/shop?category=${encodeURIComponent(category.query)}`} key={category.name} className="group rounded-lg border border-line bg-canvas p-2 transition hover:border-brand">
              <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                <Image src={category.image} alt={category.name} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="180px" />
              </div>
              <p className="px-1 pb-2 pt-3 text-sm font-black">{category.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-14 dark:bg-white/[.02]">
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
            {products.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-10">
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
