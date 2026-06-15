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

  return (
    <header
      className="sticky top-0 z-50 border-b border-brand/35 bg-brand text-white shadow-sm"
      style={{ boxShadow: "0 1px 0 rgb(var(--brand) / .4), 0 10px 24px rgb(0 0 0 / .12)" }}
    >
      <div
        className="mx-auto flex h-[74px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8"
      >
        <Logo />

        <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/75" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            className="h-12 w-full rounded-lg border border-white/30 bg-white/10 pl-12 pr-28 text-sm text-white outline-none transition placeholder:text-white/70 focus:border-white/70 focus:ring-2 focus:ring-white/20"
          />
          <button className="absolute right-1.5 top-1.5 h-9 rounded-md bg-brand px-5 text-xs font-black text-white">
            {t("searchProducts")}
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-1 rounded-xl border border-white/30 bg-brand p-1.5 text-white sm:gap-2">
          <Link href={accountHref} className="header-action">
            <UserRound />
            <span>{user ? user.name.split(" ")[0] : t("account")}</span>
          </Link>
          <Link href="/cart" className="header-action">
            <span className="relative"><ShoppingCart />{!!cartCount && <b className="action-count">{cartCount}</b>}</span>
            <span>{t("cart")}</span>
          </Link>
          <label className="hidden h-11 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 text-white lg:flex">
            <Languages className="h-4 w-4" />
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="max-w-24 bg-transparent text-xs font-black text-white outline-none [&>option]:text-black">
              {languageCodes.map((code) => <option key={code} value={code}>{languageLabels[code]}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20 lg:flex"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? t("darkMode") : t("lightMode")}
          </button>
          <button
            type="button"
            onClick={() => setSecondaryNavOpen((value) => !value)}
            className="hidden h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 lg:grid"
            aria-label={secondaryNavOpen ? "Hide secondary navigation" : "Show secondary navigation"}
            aria-expanded={secondaryNavOpen}
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${secondaryNavOpen ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            aria-label={t("menu")}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <div className={`${secondaryNavOpen ? "hidden border-t border-white/25 bg-brand lg:block" : "hidden"}`}>
        <div className="mx-auto flex h-11 max-w-[1500px] items-center gap-6 px-8 text-xs font-bold">
          <Link href="/shop" className="rounded-full bg-white px-3 py-1.5 text-brand">{t("allCategories")}</Link>
          <Link href="/shop" className="text-white/90 hover:text-white">{t("marketplace")}</Link>
          <Link href="/promotions" className="text-white/90 hover:text-white">{t("deals")}</Link>
          <Link href="/dashboard/client" className="text-white/90 hover:text-white">{t("track")}</Link>
          <Link href="/shop?saved=true" className="text-white/90 hover:text-white">
            {t("wishlist")}{!!savedProductIds.length && <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] text-brand">{savedProductIds.length}</span>}
          </Link>
          <Link href="/shop" className="text-white/90 hover:text-white">{t("compare")}</Link>
          <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-white/70">
            <MapPin className="h-4 w-4 text-white" />
            <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="bg-transparent font-bold text-white outline-none [&>option]:text-black">
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
          {user && <button onClick={handleSignOut} className="font-black text-white">{t("signout")}</button>}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/25 bg-brand p-4 text-white lg:hidden">
          <form onSubmit={submitSearch} className="relative md:hidden">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/75" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              className="h-12 w-full rounded-md border border-white/30 bg-white/10 pl-11 pr-12 text-sm text-white outline-none placeholder:text-white/70 focus:border-white/70"
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
