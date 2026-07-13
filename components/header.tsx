"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgePercent,
  ChevronDown,
  CircleHelp,
  Flame,
  Languages,
  MapPin,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Store,
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

  const secondaryNavLinks = [
    { href: "/shop", label: t("marketplace"), Icon: Store },
    { href: "/promotions", label: t("deals"), Icon: BadgePercent },
    { href: "/branches", label: "Branches", Icon: MapPin },
    { href: "/faq", label: "FAQ", Icon: CircleHelp },
  ];

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

        <Link
          href="/trending"
          className="hidden h-8 shrink-0 items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-3 text-[11px] font-black text-ink transition hover:border-brand hover:bg-brand/10 lg:inline-flex dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          <Flame className="h-3.5 w-3.5 text-brand dark:text-white" />
          <span>Trending</span>
        </Link>

        {/* Search bar — takes all available middle space, matches shop style */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 md:flex md:items-center">
          <Search className="input-icon" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search")}
            className="form-input pl-11 pr-12"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md bg-brand text-white transition hover:bg-brand/90"
            aria-label={t("searchProducts")}
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Right-side nav */}
        <nav className="flex shrink-0 items-center gap-1">

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

          {/* Theme toggle — always visible */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-brand/30 bg-white text-ink transition hover:bg-brand/10 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
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
        <div className="border-t border-brand/20 bg-white/95 backdrop-blur dark:border-white/15 dark:bg-[#231a10]/95">
          <div className="mx-auto grid max-w-[1500px] gap-4 px-6 py-5 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
            <div className="rounded-2xl border border-brand/10 bg-brand/5 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Need help?</p>
              <h3 className="mt-2 text-sm font-black text-ink dark:text-white">Fast support and order tracking</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reach our team quickly or jump straight to your order updates from the customer dashboard.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/faq" onClick={() => setSecondaryNavOpen(false)} className="inline-flex items-center rounded-full bg-brand px-3 py-1.5 text-[10px] font-black text-white transition hover:bg-brand/90">
                  Read FAQ
                </Link>
                <Link href="/dashboard/client" onClick={() => setSecondaryNavOpen(false)} className="inline-flex items-center rounded-full border border-brand/20 bg-white px-3 py-1.5 text-[10px] font-black text-ink transition hover:bg-brand/10 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                  Track order
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#22180e]">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Explore more</p>
              <div className="mt-3 space-y-2">
                {secondaryNavLinks.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSecondaryNavOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4 text-brand dark:text-white" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#22180e]">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Continue shopping</p>
              <div className="mt-3 space-y-2">
                <Link href="/shop" onClick={() => setSecondaryNavOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
                  Browse the full marketplace
                </Link>
                <Link href="/cart" onClick={() => setSecondaryNavOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
                  Review your cart
                </Link>
                <Link href="/about" onClick={() => setSecondaryNavOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
                  Learn about Simba
                </Link>
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
