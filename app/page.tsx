import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, CheckCircle2, ChevronRight, Clock3, Globe2, Headphones, Heart, Menu, PackageCheck, Search, ShieldCheck, ShoppingBasket, Sparkles, Star, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { categories, deliverySteps, products } from "@/lib/data";
import { LandingTicker } from "@/components/landing-ticker";

export default function Home() {
  return (
    <div className="landing-backdrop">
      <section className="border-b border-line bg-white/90 dark:bg-[#151619]/90">
        <div className="relative min-h-[760px] overflow-hidden text-white">
          <Image
            src="/images/hero_image.png"
            alt="Simba Supermarket storefront at sunset"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,8,12,.78)_0%,rgba(10,8,12,.56)_38%,rgba(10,8,12,.14)_68%,rgba(10,8,12,.04)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,8,12,.38)_0%,transparent_45%,rgba(0,0,0,.08)_100%)]" />
          <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-10 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:px-10">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/20 bg-black/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.22em] text-[#a8e6f7] backdrop-blur-sm">Simba online supermarket</span>
              <h1 className="mt-7 font-serif text-5xl leading-[.92] tracking-[-.04em] sm:text-7xl lg:text-[94px]">
                Freshness,<br />right at home.
              </h1>
              <p className="mt-7 max-w-2xl font-serif text-lg text-white/80 sm:text-2xl">
                Groceries, everyday essentials and Simba favourites delivered from our market to your door.
              </p>
              <form action="/shop" className="mt-8 flex h-16 w-full max-w-2xl overflow-hidden rounded-full border border-white/30 bg-white/95 text-[#171719] shadow-[0_8px_24px_rgba(0,0,0,.10)]">
                <Search className="ml-6 mt-[22px] h-5 w-5 shrink-0 text-brand" />
                <input name="q" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none sm:text-base" placeholder="Search milk, bread, rice and Simba favourites" />
                <button type="submit" aria-label="Search the marketplace" className="m-1.5 grid w-14 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:opacity-90"><ArrowRight className="h-5 w-5" /></button>
              </form>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                <Link href="/shop" className="inline-flex min-h-16 items-center gap-7 rounded-full bg-[#65b4dc] py-1 pl-8 pr-1 text-base font-bold text-[#082326] transition hover:bg-[#83d8f2]">
                  Start shopping
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-[#082326]"><ArrowRight className="h-5 w-5 -rotate-45" /></span>
                </Link>
                <Link href="/shop?category=Simba%20Favourites" className="inline-flex min-h-16 items-center rounded-full bg-white px-9 text-base font-bold text-[#171719] shadow-[0_8px_18px_rgba(255,255,255,.18)] transition hover:bg-[#edf9fc]">
                  See favourites
                </Link>
              </div>
              <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[["16+", "Products ready"], ["30-45", "Minutes delivery"], ["8", "Market branches"]].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/15 bg-black/10 p-5 backdrop-blur-sm">
                    <p className="font-serif text-3xl">{value}</p>
                    <p className="mt-1 text-xs font-bold text-white/65">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="hidden h-[520px] overflow-hidden rounded-[32px] border border-white/15 bg-black/12 p-3 backdrop-blur-sm lg:block" aria-label="Marketplace highlights">
              <LandingTicker direction="vertical" />
            </aside>

          </div>

          <div className="absolute inset-x-0 bottom-0 overflow-hidden border-y border-white/15 bg-brand/95 py-4 backdrop-blur">
            <LandingTicker direction="horizontal" />
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] bg-canvas/95 px-5 py-8 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div><span className="text-[10px] font-black uppercase text-brand">Simba Rwanda shelf</span><h2 className="mt-1 text-xl font-black">Favourites for Rwanda</h2></div>
            <Link href="/shop?category=Simba%20Favourites" className="flex items-center gap-2 text-xs font-black text-brand">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-5">
          <div><span className="eyebrow">Shop your way</span><h2 className="section-title mt-3">Everything you need, all in one place.</h2></div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-brand sm:flex">View all categories <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link href={`/shop?category=${category.query}`} key={category.name} className="group">
              <div className={`relative aspect-[4/5] overflow-hidden rounded-md border-b-4 ${["border-[#e44d26]","border-[#16865c]","border-[#f0b323]","border-[#3867d6]","border-[#8b4bb5]","border-[#e78b22]"][categories.indexOf(category)]}`}>
                <Image src={category.image} alt={category.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 17vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-0 p-4 text-white"><h3 className="font-black">{category.name}</h3><p className="mt-1 text-[11px] text-white/65">{category.count}</p></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-20 dark:bg-white/[.025]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-5">
            <div><span className="eyebrow">Popular right now</span><h2 className="section-title mt-3">Fresh finds. Fair prices.</h2></div>
            <Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-brand sm:flex">Shop all products <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-7">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10">
        <div className="relative min-h-[520px] overflow-hidden rounded-md">
          <Image src="/images/4.jpg" alt="Fresh market products" fill className="object-cover" sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute bottom-0 max-w-lg p-8 text-white"><span className="text-xs font-black uppercase text-red-400">Made for Rwanda</span><h2 className="mt-3 text-4xl font-black tracking-tight">Local roots.<br />Reliable delivery.</h2><p className="mt-4 text-sm leading-6 text-white/70">From trusted Rwanda producers to Simba branches nationwide, everyday shopping stays close, dependable, and easy to track.</p></div>
        </div>
        <div className="flex flex-col justify-center lg:pl-8">
          <span className="eyebrow">Why choose Simba</span>
          <h2 className="section-title mt-3">Confidence in every click.</h2>
          <p className="mt-5 max-w-lg leading-7 text-muted">Smart shopping should feel simple. We verify sellers, protect every payment, and keep you informed until your order reaches the door.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              [BadgeCheck, "Verified sellers", "Quality shops reviewed for trust and consistency."],
              [ShieldCheck, "Protected payments", "Secure checkout with buyer-first protection."],
              [Truck, "Delivery you can see", "Live status from confirmation to your door."],
              [Headphones, "Real support", "Helpful people when you need an answer."],
            ].map(([Icon, title, text]) => <div key={String(title)} className="border-t border-line pt-5"><Icon className="h-6 w-6 text-brand" /><h3 className="mt-4 font-black">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted">{String(text)}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#17181b] py-20 text-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10">
          <div><span className="text-xs font-black uppercase text-red-400">Delivery, made visible</span><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Know where your order is. Always.</h2><p className="mt-5 max-w-lg leading-7 text-white/60">Clear milestones and timely updates turn waiting into confidence. Follow every product from seller confirmation to doorstep delivery.</p><Link href="/dashboard/client" className="button-primary mt-8">Track a delivery <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="rounded-md bg-white p-6 text-[#17181b] sm:p-8">
            <div className="flex items-center justify-between border-b border-black/10 pb-5"><div><p className="text-[10px] font-black uppercase text-gray-500">Order #SMB-48219</p><h3 className="mt-1 font-black">Fresh market basket</h3></div><span className="rounded-sm bg-green-100 px-3 py-1 text-xs font-bold text-green-700">On the way</span></div>
            <div className="mt-7 space-y-0">{deliverySteps.map((step, i) => <div key={step} className="flex gap-4"><div className="flex flex-col items-center"><div className={`grid h-8 w-8 place-items-center rounded-full ${i <= 3 ? "bg-red-600 text-white" : "bg-gray-100 text-gray-400"}`}>{i <= 2 ? <CheckCircle2 className="h-4 w-4" /> : i === 3 ? <Truck className="h-4 w-4" /> : <Box className="h-4 w-4" />}</div>{i < 4 && <div className={`h-10 w-px ${i < 3 ? "bg-red-600" : "bg-gray-200"}`} />}</div><div className="pt-1"><p className={`text-sm font-bold ${i <= 3 ? "text-gray-900" : "text-gray-400"}`}>{step}</p>{i === 3 && <p className="mt-1 text-xs text-gray-500">Estimated today, 4:30 PM</p>}</div></div>)}</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-10">
        <div className="text-center"><span className="eyebrow">Trusted around the world</span><h2 className="section-title mx-auto mt-3 max-w-2xl">Real people. Better shopping.</h2></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["“Simba gives my small farm a storefront beyond my city. Orders are clear and payment is dependable.”", "Amara N.", "Verified seller"],
            ["“I found produce, pantry basics, and a birthday gift in one basket. Delivery updates were excellent.”", "David K.", "Smart shopper"],
            ["“The checkout feels secure and the quality from every seller has been consistently high.”", "Lindi M.", "Simba member"],
          ].map(([quote, name, role]) => <blockquote key={name} className="border border-line p-7"><div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div><p className="mt-6 text-lg font-bold leading-8">{quote}</p><footer className="mt-7 border-t border-line pt-5"><p className="text-sm font-black">{name}</p><p className="mt-1 text-xs text-muted">{role}</p></footer></blockquote>)}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-md bg-brand px-6 py-14 text-white sm:px-12">
          <Image src="/images/12.jpg" alt="Global market produce" fill className="object-cover opacity-20 mix-blend-multiply" sizes="100vw" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center"><div><span className="text-xs font-black uppercase text-white/65">The world is your market</span><h2 className="mt-3 max-w-2xl text-4xl font-black tracking-tight">Fresh opportunities start here.</h2><p className="mt-3 text-white/75">Join buyers and sellers building a more connected marketplace.</p></div><Link href="/signup" className="button-primary shrink-0 !bg-white !text-[#171717]">Create free account <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
    </div>
  );
}
