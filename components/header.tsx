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
import { useState, useRef, useEffect } from "react";
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
    showCategories,
    setShowCategories,
    t,
  } = useStore();

  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const branchButtonRef = useRef<HTMLButtonElement | null>(null);
  const branchPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent | TouchEvent) {
      if (!branchMenuOpen) return;
      const target = e.target as Node;
      if (branchButtonRef.current?.contains(target)) return;
      if (branchPanelRef.current?.contains(target)) return;
      setBranchMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setBranchMenuOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [branchMenuOpen]);

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
  const hideHeader = pathname === "/signin" || pathname === "/signup";

  if (hideHeader) return null;

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
      <div className="mx-auto flex min-h-[80px] max-w-[1500px] items-center gap-4 px-3 py-3 sm:px-5 lg:gap-6 lg:px-6">

        <div className="flex items-center gap-3 relative">
          <Logo />
          <button
            type="button"
            onClick={() => {
              if (pathname?.startsWith("/shop")) {
                setShowCategories(!showCategories);
              } else {
                setShowCategories(true);
                router.push("/shop");
              }
            }}
            aria-expanded={showCategories}
            className={`hidden md:inline-flex items-center rounded-md px-3 py-1 text-sm font-black text-white shadow-sm ${showCategories && pathname?.startsWith("/shop") ? "bg-brand/90 ring-2 ring-brand/30" : "bg-brand"}`}
          >
            {t("allCategories")}
          </button>

          {/* Visual branch dropdown for desktop */}
          <div className="hidden md:inline-flex items-center relative">
            <button
              ref={branchButtonRef}
              type="button"
              onClick={() => setBranchMenuOpen((v) => !v)}
              className="h-9 inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink dark:bg-white/5 dark:text-white"
              aria-haspopup="true"
              aria-expanded={branchMenuOpen}
            >
              <span className="font-semibold truncate max-w-[160px]">{branches.find((b) => b.id === selectedBranchId)?.name || "Select branch"}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {branchMenuOpen && (
              <div ref={branchPanelRef} className="absolute left-0 mt-2 w-72 rounded-md border border-line bg-white shadow-lg dark:bg-[#0f0f0f] z-50">
                <ul className="max-h-64 overflow-auto">
                  {branches.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedBranchId(b.id); setBranchMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-brand/5 dark:hover:bg-white/5"
                      >
                        <div className="font-bold text-sm text-ink dark:text-white">{b.name}</div>
                        <div className="text-xs text-muted">{b.city} · {b.province}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 items-center mx-4">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-ink/60 h-5 w-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search")}
              className="w-full h-12 rounded-full border-2 border-gray-200 pl-14 pr-44 text-sm font-semibold focus:outline-none focus:ring-0 focus:border-brand"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--brand))] px-6 py-2 text-white font-black shadow-md hover:brightness-90"
              aria-label={t("searchProducts")}
            >
              <span className="hidden sm:inline">Search</span>
              <Search className="sm:hidden h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/trending" className="hidden lg:inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black bg-white/90 dark:bg-black dark:text-white hover:bg-brand/5 dark:hover:bg-white/5">
            <Flame className="h-4 w-4 text-brand" />
            <span className="hidden lg:inline">Trending</span>
          </Link>
          <button
            type="button"
            onClick={() => setSecondaryNavOpen((v) => !v)}
            className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-md border border-brand/25 bg-white text-ink dark:bg-black dark:text-white hover:bg-brand/10 dark:hover:bg-white/10"
            aria-label={secondaryNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={secondaryNavOpen}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${secondaryNavOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand/30 bg-white text-ink transition hover:bg-brand/10 dark:border-white/20 dark:bg-white/10 dark:text-white"
            aria-label={theme === "light" ? t("darkMode") : t("lightMode")}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {user ? (
            <button type="button" onClick={handleSignOut} className="hidden md:inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-xs font-semibold hover:bg-brand/5">
              <UserRound className="h-4 w-4" />
              <span className="hidden lg:inline">{t("signout")}</span>
            </button>
          ) : (
            <Link href={accountHref} className="inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-xs font-semibold hover:bg-brand/5">
              <UserRound className="h-4 w-4" />
              <span className="hidden lg:inline">{accountLabel}</span>
            </Link>
          )}

          <Link href="/cart" className="inline-flex items-center gap-2 rounded-md px-2 py-0.5 text-xs font-semibold hover:bg-brand/5">
            <span className="relative">
              <ShoppingCart className="h-5 w-5" />
              {!!cartCount && <b className="action-count">{cartCount}</b>}
            </span>
            <span className="hidden sm:inline">{t("cart")}</span>
          </Link>

          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="grid h-9 w-9 place-items-center rounded-md border border-brand/25 bg-white text-ink transition hover:bg-brand/10 lg:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* ── Desktop dropdown panel ── */}
      {secondaryNavOpen && (
        <div className="border-t border-brand/20 bg-white/95 backdrop-blur dark:border-white/15 dark:bg-[#231a10]/95">
          <div className="mx-auto grid max-w-[1500px] gap-4 px-6 py-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#22180e]">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Explore more</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {secondaryNavLinks.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSecondaryNavOpen(false)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4 text-brand dark:text-white" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#22180e]">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted">Continue shopping</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/shop" onClick={() => setSecondaryNavOpen(false)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
                  Browse the full marketplace
                </Link>
                <Link href="/cart" onClick={() => setSecondaryNavOpen(false)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
                  Review your cart
                </Link>
                <Link href="/about" onClick={() => setSecondaryNavOpen(false)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink transition hover:bg-brand/5 dark:text-white dark:hover:bg-white/10">
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
              className="h-11 w-full rounded-md border-2 border-brand bg-white pl-11 pr-12 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:outline-none focus:ring-0 focus:border-brand"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-md bg-[rgb(var(--brand))] text-white">
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
                className="bg-transparent text-xs font-black text-ink outline-none dark:text-white dark:bg-black [&>option]:text-black"
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
                className="max-w-[60px] bg-transparent text-[10px] font-black text-ink outline-none dark:text-white dark:bg-black [&>option]:text-black"
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
