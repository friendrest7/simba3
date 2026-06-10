"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Languages, MapPin, Menu, Moon, PhoneCall, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { LanguageCode, useStore } from "./store-provider";
import { branches, currencyOptions, CurrencyCode } from "@/lib/data";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, theme, toggleTheme, user, signOut, currency, setCurrency, selectedBranchId, setSelectedBranchId, language, setLanguage, t } = useStore();
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId) || branches[0];
  const callCenterHref = `tel:${selectedBranch.phone.replace(/[^\d+]/g, "")}`;
  const links = [[t("marketplace"), "/shop"], [t("deals"), "/shop?category=Fruits"], [t("track"), "/dashboard/client"]];
  const languages: Array<[LanguageCode, string]> = [["en", "English"], ["fr", "Français"], ["sw", "Kiswahili"], ["am", "አማርኛ"], ["tr", "Türkçe"], ["zh", "中文"]];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;
    window.dispatchEvent(new CustomEvent("simba:ask", {
      detail: `I am looking for "${query}". Show me the closest products and help me choose.`,
    }));
    router.push(`/shop?q=${encodeURIComponent(query)}`);
    setSearch("");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-brand text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:h-[72px] sm:px-5 lg:px-7">
          <Logo />
          <nav className="hidden shrink-0 items-center gap-4 xl:flex">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className={`relative py-2 text-xs font-bold transition after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-white after:transition-all ${pathname === href ? "text-white after:w-full" : "text-white/80 after:w-0 hover:text-white hover:after:w-full"}`}>{label}</Link>
            ))}
          </nav>
          <form onSubmit={submitSearch} className="relative ml-auto hidden min-w-[380px] flex-1 xl:block">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#777]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="h-11 w-full rounded-lg border border-white/25 bg-white pl-12 pr-14 text-[15px] font-medium text-[#171719] shadow-sm outline-none transition placeholder:font-normal placeholder:text-[#707070] focus:border-white focus:ring-2 focus:ring-white/35" />
            <button className="absolute right-1 top-1 grid h-9 w-10 place-items-center rounded-md bg-[#16865c] text-white transition hover:bg-[#10734e]" title="Search products"><Search className="h-4 w-4" /></button>
          </form>
          <label className="relative hidden h-9 min-w-[62px] cursor-pointer items-center justify-center gap-0.5 rounded-md border border-white/30 bg-white/10 px-1.5 text-[10px] font-black text-white transition hover:bg-white/15 xl:flex" title="Change currency">
            {currency}<ChevronDown className="h-3.5 w-3.5" />
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Currency"
            >
              {Object.keys(currencyOptions).map((code) => <option className="bg-white text-black" key={code} value={code}>{code === "RWF" ? "RWF - Rwandan Franc" : code}</option>)}
            </select>
          </label>
          <label className="relative hidden h-9 min-w-[50px] cursor-pointer items-center justify-center gap-1 rounded-md border border-white/30 bg-white/10 px-1.5 text-[10px] font-black text-white transition hover:bg-white/15 xl:flex" title={t("language")}>
            <Languages className="h-3.5 w-3.5" /><span className="uppercase">{language}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t("language")}>
              {languages.map(([code, label]) => <option className="bg-white text-black" key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <label className="relative hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/30 bg-white text-black transition hover:bg-white/90 xl:flex" title={`Shopping branch: ${branches.find((branch) => branch.id === selectedBranchId)?.name || "Choose branch"}`}>
            <MapPin className="h-3.5 w-3.5" />
            <select
              value={selectedBranchId}
              onChange={(event) => setSelectedBranchId(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Shopping branch"
            >
              {branches.map((branch) => <option className="bg-white text-black" key={branch.id} value={branch.id}>{branch.name} - {branch.province}</option>)}
            </select>
          </label>
          <a
            href={callCenterHref}
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white transition hover:bg-white/15 xl:ml-0"
            title={`Call ${selectedBranch.name}: ${selectedBranch.phone}`}
            aria-label={`Call center ${selectedBranch.phone}`}
          >
            <PhoneCall className="h-3.5 w-3.5" />
          </a>
          <button onClick={toggleTheme} className="hidden !h-9 !w-9 place-items-center rounded-md border border-white/30 bg-white/10 !text-white transition hover:!bg-white/15 [&_svg]:h-4 [&_svg]:w-4 xl:grid" title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          {user ? (
            <button
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="hidden h-9 items-center rounded-md border border-white/30 bg-white/10 px-2.5 text-[10px] font-black text-white transition hover:bg-white/15 xl:flex"
              title={`Sign out ${user.email}`}
            >
              {t("signout")}
            </button>
          ) : (
            <Link
              href="/signin"
              className="hidden h-9 items-center rounded-md border border-white/70 bg-white px-2.5 text-[10px] font-black text-brand shadow-sm transition hover:-translate-y-0.5 hover:shadow-md xl:flex"
            >
              {t("signin")}
            </Link>
          )}
          <Link
            href="/cart"
            className="relative grid h-9 w-9 shrink-0 place-items-center overflow-visible rounded-md border border-white/70 bg-white p-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            title="Shopping cart"
          >
            <img
              src="/images/cart.png?v=1"
              alt=""
              width={38}
              height={38}
              className="h-full w-full rounded-sm object-cover"
            />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#222] px-1 text-[9px] font-bold text-white ring-2 ring-brand sm:-right-1.5 sm:-top-1.5 sm:h-5 sm:min-w-5 sm:text-[10px]">{cartCount}</span>}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/35 bg-white/10 text-white transition hover:bg-white/15 xl:hidden"
            title="Menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/20 bg-brand px-4 py-4 xl:hidden">
            <form onSubmit={submitSearch} className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supermarket products..." className="h-11 w-full rounded-md border border-white/25 bg-white pl-11 pr-12 text-[#1b1b1b]" />
              <button className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded bg-[#16865c] text-white" title="Search products"><Search className="h-4 w-4" /></button>
            </form>
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {Object.keys(currencyOptions).map((code) => <button key={code} onClick={() => setCurrency(code as CurrencyCode)} className={`h-9 shrink-0 rounded-md px-3 text-xs font-black ${currency === code ? "bg-white text-brand" : "border border-white/30 text-white"}`}>{code === "RWF" ? "RWF - Franc" : code}</button>)}
            </div>
            <label className="relative mb-3 block">
              <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <select value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)} className="h-11 w-full rounded-md bg-white pl-10 pr-3 text-sm font-bold text-black" aria-label={t("language")}>
                {languages.map(([code, label]) => <option className="bg-white text-black" key={code} value={code}>{label}</option>)}
              </select>
            </label>
            <label className="relative mb-4 block">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <select
                value={selectedBranchId}
                onChange={(event) => setSelectedBranchId(event.target.value)}
                className="h-11 w-full rounded-md border border-white/25 bg-white pl-10 pr-3 text-sm font-bold text-[#1b1b1b]"
                aria-label="Shopping branch"
              >
                {branches.map((branch) => <option className="bg-white text-black" key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>)}
              </select>
            </label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <a href={callCenterHref} className="flex h-11 items-center justify-center gap-2 rounded-md bg-white text-xs font-black text-brand">
                <PhoneCall className="h-4 w-4" /> Call center
              </a>
              <button onClick={toggleTheme} className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/30 text-xs font-black text-white">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {theme === "light" ? "Dark mode" : "Light mode"}
              </button>
            </div>
            {links.map(([label, href]) => <Link onClick={() => setMenuOpen(false)} key={href} href={href} className="block border-b border-white/15 py-3 text-sm font-bold text-white/85 hover:text-white">{label}</Link>)}
            {user ? (
              <button onClick={() => { signOut(); setMenuOpen(false); router.push("/"); }} className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-black text-brand">{t("signout")}</button>
            ) : (
              <Link onClick={() => setMenuOpen(false)} href="/signin" className="mt-4 flex h-11 items-center justify-center rounded-md bg-white text-sm font-black text-brand">{t("signin")}</Link>
            )}
          </div>
        )}
      </header>
  );
}
