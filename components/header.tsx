"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Languages,
  MapPin,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { LanguageCode, useStore } from "./store-provider";
import { branches } from "@/lib/data";
import { languageLabels, languageCodes } from "@/lib/i18n";
import { cleanSearchQuery } from "@/lib/product-search";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [secondaryNavOpen, setSecondaryNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const {
    cartCount,
    theme,
    toggleTheme,
    user,
    signOut,
    selectedBranchId,
    setSelectedBranchId,
    language,
    setLanguage,
    savedProductIds,
    t,
  } = useStore();

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = cleanSearchQuery(search);
    if (!query) return;
    router.push(`/shop?q=${encodeURIComponent(query)}`);
    setSearch("");
    setMenuOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const accountHref = user ? (user.role === "client" ? "/account" : `/dashboard/${user.role}`) : `/signin?next=${encodeURIComponent(pathname)}`;
  const mobileSelectClass = "min-w-0 rounded-full border border-line bg-canvas px-3 py-2 text-[11px] font-black text-ink outline-none";
  const accountLabel = user ? user.name.split(" ")[0] : t("account");

  return (
    <header
      className="sticky top-0 z-50 border-b border-brand/25 bg-[#fff8eb] text-ink shadow-sm dark:bg-[#18130d] dark:text-white"
      style={{ boxShadow: "0 1px 0 rgb(var(--brand) / .35), 0 10px 24px rgb(0 0 0 / .14)" }}
    >
      <div
        className="mx-auto flex min-h-[61px] max-w-[1500px] items-center gap-2 px-3 py-2 sm:px-5 lg:gap-3 lg:px-6"
      >
        <Logo />

        <Link
          href="/shop"
          className="hidden h-8 shrink-0 items-center rounded-md bg-brand px-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-brand/90 lg:flex"
        >
          {t("allCategories")}
        </Link>

        <form onSubmit={submitSearch} className="relative hidden min-w-0 w-36 shrink-0 md:block lg:w-44">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink/55" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            className="h-7 w-full rounded-md border border-brand bg-white pl-6 pr-8 text-[10px] font-semibold text-ink outline-none transition placeholder:text-muted focus:ring-2 focus:ring-brand/20"
          />
          <button
            className="absolute right-0.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded bg-brand text-white shadow-sm transition hover:bg-brand/90"
            aria-label={t("searchProducts")}
          >
            <Search className="h-2.5 w-2.5" />
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-1">
          {/* Language selector — always visible on lg+ */}
          <label className="hidden h-7 cursor-pointer items-center gap-1 rounded-md border border-brand/30 bg-white px-1.5 text-ink lg:flex dark:border-white/15 dark:bg-white/10 dark:text-white" title="Language">
            <Languages className="h-3 w-3 shrink-0 text-brand dark:text-white" />
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="max-w-[52px] bg-transparent text-[9px] font-black text-ink outline-none dark:text-white [&>option]:text-black">
              {languageCodes.map((code) => <option key={code} value={code}>{languageLabels[code]}</option>)}
            </select>
          </label>

          {/* Theme toggle — always visible on lg+ */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-7 w-7 items-center justify-center rounded-md border border-brand/30 bg-white text-ink transition hover:bg-brand/10 lg:flex dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={theme === "light" ? t("darkMode") : t("lightMode")}
            title={theme === "light" ? t("darkMode") : t("lightMode")}
          >
            {theme === "light" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="header-action bg-brand/10 text-ink hover:bg-brand/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              title={t("signout")}
            >
              <UserRound />
              <span>{t("signout")}</span>
            </button>
          ) : (
            <Link href={accountHref} className="header-action bg-brand/10 text-ink hover:bg-brand/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
              <UserRound />
              <span>{accountLabel}</span>
            </Link>
          )}
          <Link href="/cart" className="header-action bg-brand/10 text-ink hover:bg-brand/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
            <span className="relative"><ShoppingCart />{!!cartCount && <b className="action-count">{cartCount}</b>}</span>
            <span>{t("cart")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setSecondaryNavOpen((value) => !value)}
            className="hidden h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:grid dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={secondaryNavOpen ? "Hide secondary navigation" : "Show secondary navigation"}
            aria-expanded={secondaryNavOpen}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${secondaryNavOpen ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:hidden dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={t("menu")}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </div>
          <button
            type="button"
            onClick={() => setSecondaryNavOpen((value) => !value)}
            className="hidden h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:grid dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={secondaryNavOpen ? "Hide secondary navigation" : "Show secondary navigation"}
            aria-expanded={secondaryNavOpen}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${secondaryNavOpen ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:hidden dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={t("menu")}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </div>

      <div className={`${secondaryNavOpen ? "hidden border-t border-brand/20 bg-white lg:block dark:border-white/15 dark:bg-[#231a10]" : "hidden"}`}>
        {/* Top quick-links bar */}
        <div className="mx-auto flex h-9 max-w-[1500px] items-center gap-4 px-6 text-[11px] font-bold">
          <Link href="/shop" className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-black text-brand">{t("allCategories")}</Link>
          <Link href="/shop" className="text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("marketplace")}</Link>
          <Link href="/promotions" className="text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("deals")}</Link>
          <Link href="/trending" className="flex items-center gap-1 font-black text-brand dark:text-brand">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Trending
          </Link>
          <Link href="/dashboard/client" className="text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("track")}</Link>
          <Link href="/shop?saved=true" className="text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">
            {t("wishlist")}{!!savedProductIds.length && <span className="ml-1 rounded bg-brand px-1 py-0.5 text-[8px] text-white">{savedProductIds.length}</span>}
          </Link>
          <Link href="/shop" className="text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("compare")}</Link>
          <label className="ml-auto flex cursor-pointer items-center gap-1.5 rounded border border-brand/20 bg-brand/5 px-2 py-1 text-ink/75 dark:border-white/20 dark:bg-white/10 dark:text-white/80">
            <MapPin className="h-3 w-3 text-brand dark:text-white" />
            <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="bg-transparent text-[10px] font-bold text-ink outline-none dark:text-white [&>option]:text-black">
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
          {user && <Link onClick={() => setSecondaryNavOpen(false)} href={accountHref} className="font-black text-brand dark:text-white">{user.name.split(" ")[0]}</Link>}
        </div>
        {/* Rich nav panel with descriptions */}
        <div className="border-t border-brand/10 dark:border-white/10">
          <div className="mx-auto grid max-w-[1500px] grid-cols-4 gap-0 px-6 py-5">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Explore</p>
              <div className="space-y-3">
                <Link href="/about" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">🏪</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">About Simba</p>
                    <p className="text-[10px] text-muted">Our story, mission &amp; values</p>
                  </div>
                </Link>
                <Link href="/branches" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">📍</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Our Branches</p>
                    <p className="text-[10px] text-muted">9 locations across Rwanda</p>
                  </div>
                </Link>
                <Link href="/faq" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">❓</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">FAQ</p>
                    <p className="text-[10px] text-muted">Quick answers to common questions</p>
                  </div>
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Shop</p>
              <div className="space-y-3">
                <Link href="/trending" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">🔥</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Trending Now</p>
                    <p className="text-[10px] text-muted">Most-bought &amp; BOGO deals this week</p>
                  </div>
                </Link>
                <Link href="/promotions" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">🏷️</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Deals &amp; Offers</p>
                    <p className="text-[10px] text-muted">Flash sales, bundles &amp; discounts</p>
                  </div>
                </Link>
                <Link href="/shop?saved=true" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">❤️</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Wishlist</p>
                    <p className="text-[10px] text-muted">Your saved products{savedProductIds.length > 0 ? ` (${savedProductIds.length})` : ""}</p>
                  </div>
                </Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">My Orders</p>
              <div className="space-y-3">
                <Link href="/dashboard/client" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">📦</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Track Order</p>
                    <p className="text-[10px] text-muted">Live driver location &amp; ETA</p>
                  </div>
                </Link>
                <Link href="/shop" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">🔄</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Compare Products</p>
                    <p className="text-[10px] text-muted">Side-by-side product comparison</p>
                  </div>
                </Link>
                <Link href="/cart" onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-brand text-sm">🛒</span>
                  <div>
                    <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">Your Cart</p>
                    <p className="text-[10px] text-muted">Review items &amp; checkout</p>
                  </div>
                </Link>
              </div>
            </div>
            <div className="rounded-xl bg-brand/5 p-4 dark:bg-white/5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">Contact Us</p>
              <p className="text-[11px] font-black text-ink dark:text-white">Simba Supermarket Rwanda</p>
              <a href="tel:+250796198326" className="mt-1 block text-[11px] font-bold text-brand hover:underline">📞 +250 796 198 326</a>
              <p className="mt-1 text-[10px] text-muted">Mon–Sat · 8 AM – 9 PM</p>
              <p className="mt-0.5 text-[10px] text-muted">Sun · 9 AM – 6 PM</p>
              <Link href="/faq" onClick={() => setSecondaryNavOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-[10px] font-black text-white hover:bg-brand/90">
                Get Help →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-brand/20 bg-white p-4 text-ink dark:border-white/15 dark:bg-[#231a10] dark:text-white lg:hidden">
          <form onSubmit={submitSearch} className="relative md:hidden">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              className="h-12 w-full rounded-md border-2 border-brand bg-white pl-11 pr-12 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-brand/20"
            />
            <button className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-md bg-brand text-white"><Search className="h-4 w-4" /></button>
          </form>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" onClick={toggleTheme} className="flex items-center justify-center gap-2 rounded-full border border-line bg-canvas px-3 py-2 text-xs font-black text-ink">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? t("darkMode") : t("lightMode")}
            </button>
            <label className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-2 text-muted">
              <Languages className="h-4 w-4 text-brand" />
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className={mobileSelectClass}>
                {languageCodes.map((code) => <option key={code} value={code}>{languageLabels[code]}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-2 text-muted">
              <MapPin className="h-4 w-4 text-brand" />
              <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className={mobileSelectClass}>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link onClick={() => setMenuOpen(false)} href="/shop" className="button-secondary">{t("marketplace")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/promotions" className="button-secondary">{t("deals")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/dashboard/client" className="button-secondary">{t("track")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/shop?saved=true" className="button-secondary">{t("wishlist")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/cart" className="button-secondary">{t("cart")}{!!cartCount && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">{cartCount}</span>}</Link>
            {user && <Link onClick={() => setMenuOpen(false)} href={accountHref} className="button-secondary">{t("account")}</Link>}
            {user ? <button onClick={handleSignOut} className="button-primary">{t("signout")}</button> : <Link onClick={() => setMenuOpen(false)} href="/signin" className="button-primary">{t("signin")}</Link>}
          </div>
        </div>
      )}
    </header>
  );
}
