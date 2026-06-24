"use client";

import { Mail, Phone, MapPin, History, Info } from "lucide-react";
import { useStore } from "@/components/store-provider";

export default function AboutPage() {
  const { t } = useStore();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 lg:px-10">
      <section className="mb-16">
        <span className="eyebrow">{t("about")}</span>
        <h1 className="mt-3 text-4xl font-black tracking-tight">About Simba Supermarket</h1>
        <p className="mt-4 text-lg text-muted leading-relaxed">
          Serving the community with freshness and quality since 2007.
        </p>
      </section>

      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-brand" />
            <h2 className="text-2xl font-black">Our History</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert text-muted max-w-none">
            <p>
              Established in 2007, Simba Supermarket has grown from a local neighborhood store into one of Rwanda&apos;s most trusted 
              retailers. Our journey began with a simple mission: to provide high-quality, fresh, and affordable grocery products 
              to every household in the community.
            </p>
            <p className="mt-4">
              Over the past two decades, we have expanded our reach across various districts, 
              investing in modern supply chains and technology to ensure that our customers always find 
              what they need, when they need it.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Info className="h-6 w-6 text-brand" />
            <h2 className="text-2xl font-black">Our Mission</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert text-muted max-w-none">
            <p>
              To be the preferred choice for daily essentials by delivering exceptional freshness, 
              unbeatable value, and unparalleled customer service. We take pride in supporting 
              local farmers and producers, contributing to the growth of the Rwandan economy.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-20 rounded-2xl border border-line bg-canvas p-8 sm:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-black">Contact Us</h2>
          <p className="mt-2 text-muted">We are here to help with your shopping needs and inquiries.</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold">Email Us</h3>
            <p className="mt-1 text-sm text-muted">info@simbasupermarket.rw</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold">Call Us</h3>
            <p className="mt-1 text-sm text-muted">+250 788 000 000</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold">Visit Us</h3>
            <p className="mt-1 text-sm text-muted">Kigali, Rwanda</p>
          </div>
        </div>
      </section>
    </div>
  );
}
