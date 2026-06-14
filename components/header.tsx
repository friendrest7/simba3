"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GitCompareArrows,
  Heart,
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
      className="sticky top-0 z-50 border-b border-line/80 bg-canvas/95 shadow-sm backdrop-blur"
      style={{ boxShadow: "0 1px 0 rgb(var(--brand) / .12), 0 10px 24px rgb(0 0 0 / .04)" }}
    >
      <div
        className="mx-auto flex h-[74px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8"
        style={{ background: "linear-gradient(90deg, rgb(var(--brand) / .10), transparent 52%)" }}
      >
        <Logo />

        <form onSubmit={submitSearch} className="relative hidden min-w-0 flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search")}
            className="h-12 w-full rounded-lg border border-line bg-white pl-12 pr-28 text-sm text-[#171719] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 dark:bg-white/5 dark:text-white"
          />
          <button className="absolute right-1.5 top-1.5 h-9 rounded-md bg-brand px-5 text-xs font-black text-white">
            {t("searchProducts")}
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href={accountHref} className="header-action">
            <UserRound />
            <span>{user ? user.name.split(" ")[0] : t("account")}</span>
          </Link>
          <Link href="/shop?saved=true" className="header-action">
            <span className="relative"><Heart />{!!savedProductIds.length && <b className="action-count">{savedProductIds.length}</b>}</span>
            <span>{t("wishlist")}</span>
          </Link>
          <Link href="/shop" className="header-action hidden lg:flex">
            <GitCompareArrows />
            <span>{t("compare")}</span>
          </Link>
          <Link href="/cart" className="header-action">
            <span className="relative"><ShoppingCart />{!!cartCount && <b className="action-count">{cartCount}</b>}</span>
            <span>{t("cart")}</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-11 items-center gap-2 rounded-full border border-line bg-canvas px-3 text-xs font-black text-ink transition hover:border-brand hover:text-brand lg:flex"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {theme === "light" ? t("darkMode") : t("lightMode")}
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas text-ink transition hover:border-brand hover:text-brand lg:hidden"
            aria-label={t("menu")}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <div className="hidden border-t border-line bg-black/[.025] dark:bg-white/[.025] lg:block">
        <div className="mx-auto flex h-11 max-w-[1500px] items-center gap-6 px-8 text-xs font-bold">
          <Link href="/shop" className="text-brand">{t("allCategories")}</Link>
          <Link href="/shop">{t("marketplace")}</Link>
          <Link href="/promotions">{t("deals")}</Link>
          <Link href="/dashboard/client">{t("track")}</Link>
          <label className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-muted">
            <MapPin className="h-4 w-4 text-brand" />
            <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)} className="bg-transparent font-bold text-ink outline-none">
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-muted">
            <Languages className="h-4 w-4 text-brand" />
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="bg-transparent font-bold text-ink outline-none">
              {languageCodes.map((code) => <option key={code} value={code}>{languageLabels[code]}</option>)}
            </select>
          </label>
          {user && <button onClick={handleSignOut} className="font-black text-brand">{t("signout")}</button>}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-canvas p-4 lg:hidden" style={{ background: "linear-gradient(180deg, rgb(var(--brand) / .08), transparent 52%)" }}>
          <form onSubmit={submitSearch} className="relative md:hidden">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search")} className="form-input pl-11 pr-12" />
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
