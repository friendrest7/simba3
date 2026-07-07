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

  const accountHref = user
    ? user.role === "client"
      ? "/account"
      : `/dashboard/${user.role}`
    : `/signin?next=${encodeURIComponent(pathname)}`;
  const accountLabel = user ? user.name.split(" ")[0] : t("account");

  return (
    <header
      className="sticky top-0 z-50 border-b border-brand/25 bg-[#fff8eb] text-ink shadow-sm dark:bg-[#18130d] dark:text-white"
      style={{ boxShadow: "0 1px 0 rgb(var(--brand) / .35), 0 10px 24px rgb(0 0 0 / .14)" }}
    >
      {/* ── Main bar ── */}
      <div className="mx-auto flex min-h-[61px] max-w-[1500px] items-center gap-2 px-3 py-2 sm:px-5 lg:gap-3 lg:px-6">

        <Logo />

        <Link
          href="/shop"
          className="hidden h-8 shrink-0 items-center rounded-md bg-brand px-2.5 text-[11px] font-black text-white shadow-sm transition hover:bg-brand/90 lg:flex"
        >
          {t("allCategories")}
        </Link>

        {/* Search bar */}
        <form onSubmit={submitSearch} className="relative hidden w-36 shrink-0 md:block lg:w-44">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-ink/55" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="h-7 w-full rounded-md border border-brand bg-white pl-6 pr-8 text-[10px] font-semibold text-ink outline-none transition placeholder:text-muted focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="submit"
            className="absolute right-0.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded bg-brand text-white transition hover:bg-brand/90"
            aria-label={t("searchProducts")}
          >
            <Search className="h-2.5 w-2.5" />
          </button>
        </form>

        {/* Right-side nav */}
        <nav className="ml-auto flex items-center gap-1">

          {/* Language — visible on lg+ */}
          <label
            className="hidden h-8 cursor-pointer items-center gap-1.5 rounded-md border border-brand/30 bg-white px-2 text-ink lg:flex dark:border-white/20 dark:bg-white/10 dark:text-white"
            title="Select language"
          >
            <Languages className="h-3.5 w-3.5 shrink-0 text-brand dark:text-white" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-16 bg-transparent text-[10px] font-black text-ink outline-none dark:text-white [&>option]:text-black"
            >
              {languageCodes.map((code) => (
                <option key={code} value={code}>{languageLabels[code]}</option>
              ))}
            </select>
          </label>

          {/* Theme toggle — visible on lg+ */}
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-8 w-8 items-center justify-center rounded-md border border-brand/30 bg-white text-ink transition hover:bg-brand/10 lg:flex dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={theme === "light" ? t("darkMode") : t("lightMode")}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          {/* Account / Sign out */}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="header-action bg-brand/10 text-ink hover:bg-brand/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
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

          {/* Cart */}
          <Link href="/cart" className="header-action bg-brand/10 text-ink hover:bg-brand/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
            <span className="relative">
              <ShoppingCart />
              {!!cartCount && <b className="action-count">{cartCount}</b>}
            </span>
            <span>{t("cart")}</span>
          </Link>

          {/* Dropdown chevron — desktop */}
          <button
            type="button"
            onClick={() => setSecondaryNavOpen((v) => !v)}
            className="hidden h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:grid dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={secondaryNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={secondaryNavOpen}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${secondaryNavOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Hamburger — mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:hidden dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

        </nav>
      </div>

      {/* ── Desktop dropdown panel ── */}
      {secondaryNavOpen && (
        <div className="border-t border-brand/20 bg-white dark:border-white/15 dark:bg-[#231a10]">
          {/* Quick-links bar */}
          <div className="mx-auto flex h-9 max-w-[1500px] items-center gap-4 overflow-x-auto px-6 text-[11px] font-bold">
            <Link href="/shop" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 rounded bg-brand/10 px-2 py-0.5 text-[10px] font-black text-brand">{t("allCategories")}</Link>
            <Link href="/shop" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("marketplace")}</Link>
            <Link href="/promotions" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("deals")}</Link>
            <Link href="/trending" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 flex items-center gap-1 font-black text-brand">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              Trending
            </Link>
            <Link href="/dashboard/client" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">{t("track")}</Link>
            <Link href="/shop?saved=true" onClick={() => setSecondaryNavOpen(false)} className="shrink-0 text-ink/75 hover:text-ink dark:text-white/90 dark:hover:text-white">
              {t("wishlist")}{!!savedProductIds.length && <span className="ml-1 rounded bg-brand px-1 py-0.5 text-[8px] text-white">{savedProductIds.length}</span>}
            </Link>
            <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 rounded border border-brand/20 bg-brand/5 px-2 py-1 text-ink/75 dark:border-white/20 dark:bg-white/10 dark:text-white/80">
              <MapPin className="h-3 w-3 text-brand dark:text-white" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-ink outline-none dark:text-white [&>option]:text-black"
              >
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            {user && (
              <Link onClick={() => setSecondaryNavOpen(false)} href={accountHref} className="shrink-0 font-black text-brand dark:text-white">
                {user.name.split(" ")[0]}
              </Link>
            )}
          </div>

          {/* Rich 4-column panel */}
          <div className="border-t border-brand/10 dark:border-white/10">
            <div className="mx-auto grid max-w-[1500px] grid-cols-4 gap-0 px-6 py-5">

              {/* Explore */}
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Explore</p>
                <div className="space-y-3">
                  {[
                    { href: "/about", emoji: "🏪", title: "About Simba", sub: "Our story, mission & values" },
                    { href: "/branches", emoji: "📍", title: "Our Branches", sub: "9 locations across Rwanda" },
                    { href: "/faq", emoji: "❓", title: "FAQ", sub: "Quick answers to common questions" },
                  ].map(({ href, emoji, title, sub }) => (
                    <Link key={href} href={href} onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-sm">{emoji}</span>
                      <div>
                        <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">{title}</p>
                        <p className="text-[10px] text-muted">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Shop */}
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Shop</p>
                <div className="space-y-3">
                  {[
                    { href: "/trending", emoji: "🔥", title: "Trending Now", sub: "Most-bought & BOGO deals this week" },
                    { href: "/promotions", emoji: "🏷️", title: "Deals & Offers", sub: "Flash sales, bundles & discounts" },
                    { href: "/shop?saved=true", emoji: "❤️", title: "Wishlist", sub: `Your saved products${savedProductIds.length > 0 ? ` (${savedProductIds.length})` : ""}` },
                  ].map(({ href, emoji, title, sub }) => (
                    <Link key={href} href={href} onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-sm">{emoji}</span>
                      <div>
                        <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">{title}</p>
                        <p className="text-[10px] text-muted">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* My Orders */}
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">My Orders</p>
                <div className="space-y-3">
                  {[
                    { href: "/dashboard/client", emoji: "📦", title: "Track Order", sub: "Live driver location & ETA" },
                    { href: "/shop", emoji: "🔄", title: "Compare Products", sub: "Side-by-side product comparison" },
                    { href: "/cart", emoji: "🛒", title: "Your Cart", sub: "Review items & checkout" },
                  ].map(({ href, emoji, title, sub }) => (
                    <Link key={title} href={href} onClick={() => setSecondaryNavOpen(false)} className="group flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand/10 text-sm">{emoji}</span>
                      <div>
                        <p className="text-[11px] font-black text-ink group-hover:text-brand dark:text-white">{title}</p>
                        <p className="text-[10px] text-muted">{sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact + Theme/Language controls */}
              <div className="space-y-3">
                <div className="rounded-xl bg-brand/5 p-4 dark:bg-white/5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">Contact Us</p>
                  <p className="text-[11px] font-black text-ink dark:text-white">Simba Supermarket Rwanda</p>
                  <a href="tel:+250796198326" className="mt-1 block text-[11px] font-bold text-brand hover:underline">📞 +250 796 198 326</a>
                  <p className="mt-1 text-[10px] text-muted">Mon–Sat · 8 AM – 9 PM</p>
                  <p className="text-[10px] text-muted">Sun · 9 AM – 6 PM</p>
                  <Link href="/faq" onClick={() => setSecondaryNavOpen(false)} className="mt-3 inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-[10px] font-black text-white hover:bg-brand/90">
                    Get Help →
                  </Link>
                </div>

                {/* Quick theme + language in dropdown */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-[10px] font-black text-ink hover:bg-brand/10 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  >
                    {theme === "light" ? <><Moon className="h-3.5 w-3.5" /> Dark</> : <><Sun className="h-3.5 w-3.5" /> Light</>}
                  </button>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-brand/20 bg-brand/5 px-2 py-2 text-[10px] font-black text-ink hover:bg-brand/10 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                    <Languages className="h-3.5 w-3.5 text-brand dark:text-white" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                      className="w-12 bg-transparent text-[10px] font-black text-ink outline-none dark:text-white [&>option]:text-black"
                    >
                      {languageCodes.map((code) => (
                        <option key={code} value={code}>{languageLabels[code]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="border-t border-brand/20 bg-white p-4 text-ink dark:border-white/15 dark:bg-[#231a10] dark:text-white lg:hidden">
          {/* Mobile search */}
          <form onSubmit={submitSearch} className="relative md:hidden">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="h-11 w-full rounded-md border-2 border-brand bg-white pl-11 pr-12 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-brand/20"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-md bg-brand text-white">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Theme + Language + Branch */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-2 text-xs font-black text-ink"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <label className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-2 text-xs font-black text-ink">
              <Languages className="h-4 w-4 text-brand" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-black text-ink outline-none dark:text-white [&>option]:text-black"
              >
                {languageCodes.map((code) => (
                  <option key={code} value={code}>{languageLabels[code]}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-2 text-xs font-black text-ink">
              <MapPin className="h-4 w-4 text-brand" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="max-w-[60px] bg-transparent text-[10px] font-black text-ink outline-none [&>option]:text-black"
              >
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          </div>

          {/* Nav links */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link onClick={() => setMenuOpen(false)} href="/shop" className="button-secondary">{t("marketplace")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/trending" className="button-secondary">🔥 Trending</Link>
            <Link onClick={() => setMenuOpen(false)} href="/promotions" className="button-secondary">{t("deals")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/dashboard/client" className="button-secondary">{t("track")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/shop?saved=true" className="button-secondary">{t("wishlist")}</Link>
            <Link onClick={() => setMenuOpen(false)} href="/cart" className="button-secondary">
              {t("cart")}{!!cartCount && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] text-white">{cartCount}</span>}
            </Link>
          </div>

          <div className="mt-2">
            {user ? (
              <button onClick={handleSignOut} className="button-primary w-full">{t("signout")}</button>
            ) : (
              <Link onClick={() => setMenuOpen(false)} href="/signin" className="button-primary inline-flex w-full justify-center">{t("signin")}</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
