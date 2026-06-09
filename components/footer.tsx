import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./logo";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/simba_supermarket/?hl=en", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/simbasupermarket/", Icon: Facebook },
  { label: "X", href: "https://x.com/SimbaRwanda", Icon: Twitter },
  { label: "LinkedIn", href: "https://rw.linkedin.com/company/simba-supermarket-ltd-rwanda", Icon: Linkedin },
];

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["Fresh produce", "/shop?category=Fruits"],
      ["Groceries", "/shop?category=Groceries"],
      ["Simba favourites", "/shop?category=Simba%20Favourites"],
      ["Weekly deals", "/shop"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Create account", "/signup"],
      ["Sign in", "/signin"],
      ["Shopping basket", "/cart"],
      ["Secure checkout", "/checkout"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Track an order", "/dashboard/client"],
      ["Delivery branches", "/shop"],
      ["Shopping assistant", "/shop"],
      ["Contact support", "/signin"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#16171a] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div className="max-w-sm">
          <Logo inverse />
          <p className="mt-5 text-sm leading-7 text-white/60">Fresh groceries, everyday essentials, secure payments, and trackable delivery from Simba branches across Rwanda.</p>
          <div className="mt-6 flex gap-2">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit Simba on ${label}`}
                title={`Simba on ${label}`}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-white/70 transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-sm font-bold">{group.title}</h3>
            {group.links.map(([label, href]) => (
              <Link key={label} href={href} className="mb-3 block text-sm text-white/55 transition hover:translate-x-1 hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">&copy; 2026 Simba Marketplace. Buy better. Sell farther. Deliver with trust.</div>
    </footer>
  );
}
