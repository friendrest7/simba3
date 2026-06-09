"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { useState } from "react";

type Story = {
  title: string;
  message: string;
  action: string;
  href: string;
};

const horizontalStories: Story[] = [
  { title: "Fresh produce", message: "Fresh choices, carefully selected and ready for your everyday table.", action: "Shop fresh", href: "/shop?category=Fruits" },
  { title: "Simba favourites", message: "Find the bold Simba flavours people know, love, and share.", action: "See favourites", href: "/shop?category=Simba%20Favourites" },
  { title: "Secure checkout", message: "Shop with confidence through a clear, protected checkout experience.", action: "View your basket", href: "/cart" },
  { title: "Live delivery", message: "Stay informed from branch confirmation until your order reaches the door.", action: "Track an order", href: "/dashboard/client" },
  { title: "Verified sellers", message: "Trusted products begin with sellers and branches you can identify.", action: "Explore the market", href: "/shop" },
  { title: "Everyday value", message: "Useful sizes, family multipacks, and fair choices for every budget.", action: "Find value", href: "/shop" },
];

const verticalStories: Story[] = [
  { title: "Farm fresh today", message: "Bring colour, freshness, and dependable quality into every basket.", action: "Browse produce", href: "/shop?category=Vegetables" },
  { title: "30-45 min delivery", message: "Selected orders move quickly from your nearest Simba branch to you.", action: "Start shopping", href: "/shop" },
  { title: "Protected payments", message: "A simple checkout should feel clear, secure, and easy to trust.", action: "Open checkout", href: "/checkout" },
  { title: "Local sellers", message: "Simba connects shoppers with products and people closer to home.", action: "Meet the market", href: "/shop" },
  { title: "Real-time tracking", message: "Know what is happening with your order without having to guess.", action: "See tracking", href: "/dashboard/client" },
];

export function LandingTicker({ direction }: { direction: "horizontal" | "vertical" }) {
  const [selected, setSelected] = useState<Story | null>(null);
  const stories = direction === "horizontal" ? horizontalStories : verticalStories;

  return (
    <>
      {direction === "horizontal" ? (
        <div className="landing-ticker-track flex w-max items-center">
          {[...stories, ...stories].map((story, index) => (
            <button
              key={`${story.title}-${index}`}
              onClick={() => setSelected(story)}
              className="flex items-center gap-6 whitespace-nowrap px-6 text-xs font-black uppercase tracking-[.18em] outline-none transition hover:text-[#ffe176] focus-visible:text-[#ffe176]"
            >
              {story.title}<Sparkles className="h-3.5 w-3.5 text-[#ffe176]" />
            </button>
          ))}
        </div>
      ) : (
        <div className="vertical-ticker-track flex flex-col gap-3">
          {[...stories, ...stories].map((story, index) => (
            <button
              key={`${story.title}-${index}`}
              onClick={() => setSelected(story)}
              className="flex min-h-24 flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-left outline-none transition hover:border-[#83d8f2] hover:bg-white/20 focus-visible:border-[#83d8f2] focus-visible:bg-white/20"
            >
              <Sparkles className="h-4 w-4 text-[#83d8f2]" />
              <span className="text-sm font-black">{story.title}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="simba-story-title">
          <button className="absolute inset-0 cursor-default" onClick={() => setSelected(null)} aria-label="Close Simba message" />
          <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-[#001f1e] p-6 text-white shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" title="Close"><X className="h-4 w-4" /></button>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#83d8f2] text-[#001f1e]"><CheckCircle2 className="h-6 w-6" /></span>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[.2em] text-[#83d8f2]">The Simba promise</p>
            <h2 id="simba-story-title" className="mt-2 text-2xl font-black">{selected.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{selected.message}</p>
            <Link href={selected.href} onClick={() => setSelected(null)} className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-full bg-brand px-5 text-sm font-black transition hover:opacity-85">
              {selected.action}<ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
