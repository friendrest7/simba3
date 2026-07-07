"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Logo } from "./logo";
import { useStore } from "./store-provider";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/simba_supermarket/?hl=en", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/simbasupermarket/", Icon: Facebook },
  { label: "X", href: "https://x.com/SimbaRwanda", Icon: Twitter },
  { label: "LinkedIn", href: "https://rw.linkedin.com/company/simba-supermarket-ltd-rwanda", Icon: Linkedin },
];

export function Footer() {
  const { t } = useStore();
  const groups = [
    {
      title: t("shop"),
      links: [
        [t("marketplace"), "/shop"],
        ["Trending 🔥", "/trending"],
        [t("deals"), "/promotions"],
        [t("wishlist"), "/shop?saved=true"],
      ],
    },
    {
      title: t("account"),
      links: [
        [t("signup"), "/signup"],
        [t("signin"), "/signin"],
        [t("cart"), "/cart"],
        [t("checkout"), "/checkout"],
      ],
    },
    {
      title: t("help"),
      links: [
        ["FAQ", "/faq"],
        ["Our Branches", "/branches"],
        ["About Simba", "/about"],
        [t("track"), "/dashboard/client"],
      ],
    },
  ];

  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] lg:px-10">
        {/* Brand column */}
        <div className="max-w-sm">
          <Logo inverse />
          <p className="mt-5 text-sm leading-7 text-white/60">{t("footerText")}</p>
          <div className="mt-6 flex gap-2">
            {socialLinks.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-white/70 transition hover:border-white/50 hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/40">{group.title}</h3>
            {group.links.map(([label, href]) => (
              <Link key={label} href={href} className="mb-2.5 block text-sm text-white/65 transition hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        ))}

        {/* Contact Us column */}
        <div>
          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-white/40">Contact Us</h3>

          <div className="space-y-3">
            <a href="tel:+250796198326" className="flex items-start gap-3 group">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white group-hover:bg-white/20">
                <Phone className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">Phone</p>
                <p className="text-sm font-bold text-white group-hover:underline">+250 796 198 326</p>
              </div>
            </a>

            <a href="mailto:info@simba.market" className="flex items-start gap-3 group">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white group-hover:bg-white/20">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">Email</p>
                <p className="text-sm font-bold text-white group-hover:underline">info@simba.market</p>
              </div>
            </a>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-white">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">Address</p>
                <p className="text-sm text-white/80">KN 4 Ave, Centenary House,<br />Kigali, Rwanda</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase text-white/50">Opening Hours</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Mon – Sat</span>
                <span className="font-bold text-white">8:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Sunday</span>
                <span className="font-bold text-white">9:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 px-5 py-5 text-center text-xs text-white/50">
        &copy; 2026 Simba Supermarket Rwanda. All rights reserved.
      </div>
    </footer>
  );
}
