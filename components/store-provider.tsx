"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { branches, CurrencyCode, Product } from "@/lib/data";
import { LanguageCode, languageCodes, translate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

export type CartItem = { product: Product; quantity: number };
export type User = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin" | "manager" | "driver" | "ceo";
  branchId?: string;
  driverId?: string;
};
export type Accent = "red" | "green" | "blue" | "purple" | "amber" | "teal";
export type { LanguageCode } from "@/lib/i18n";

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  recentAdds: CartItem[];
  cartPanelOpen: boolean;
  user: User | null;
  authLoading: boolean;
  theme: "light" | "dark";
  accent: Accent;
  currency: CurrencyCode;
  selectedBranchId: string;
  language: LanguageCode;
  savedProductIds: string[];
  managedProducts: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  closeCartPanel: () => void;
  signOut: () => Promise<void>;
  toggleTheme: () => void;
  setAccent: (accent: Accent) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setSelectedBranchId: (branchId: string) => void;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
  toggleSavedProduct: (productId: string) => void;
  addManagedProduct: (product: Product) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function roleForUi(value: unknown): User["role"] {
  const role = String(value || "customer");
  if (role === "customer") return "client";
  if (["admin", "manager", "driver", "ceo"].includes(role)) return role as User["role"];
  return "client";
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentAdds, setRecentAdds] = useState<CartItem[]>([]);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<Accent>("amber");
  const [currency, setCurrencyState] = useState<CurrencyCode>("RWF");
  const [selectedBranchId, setSelectedBranchIdState] = useState("kigali-kic");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [managedProducts, setManagedProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const savedCart = localStorage.getItem("simba-cart");
    const savedTheme = localStorage.getItem("simba-theme") as "light" | "dark" | null;
    const savedAccent = localStorage.getItem("simba-accent") as Accent | null;
    const savedBranchId = localStorage.getItem("simba-branch");
    const savedLanguage = localStorage.getItem("simba-language") as LanguageCode | null;
    const savedProducts = localStorage.getItem("simba-saved-products");
    const savedManagedProducts = localStorage.getItem("simba-managed-products");

    try {
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedProducts) setSavedProductIds(JSON.parse(savedProducts));
      if (savedManagedProducts) setManagedProducts(JSON.parse(savedManagedProducts));
    } catch {
      localStorage.removeItem("simba-cart");
      localStorage.removeItem("simba-saved-products");
      localStorage.removeItem("simba-managed-products");
    }
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    if (savedAccent) setAccentState(savedAccent);
    if (savedBranchId && branches.some((branch) => branch.id === savedBranchId)) setSelectedBranchIdState(savedBranchId);
    if (savedLanguage && languageCodes.includes(savedLanguage)) setLanguageState(savedLanguage);
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function syncUser(authUser: SupabaseUser | null) {
      if (!active) return;
      if (!authUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, branch_id")
        .eq("id", authUser.id)
        .maybeSingle();
      if (!active) return;

      const role = roleForUi(profile?.role);
      const email = authUser.email || "";
      const metadataName = typeof authUser.user_metadata?.full_name === "string" ? authUser.user_metadata.full_name : "";
      setUser({
        id: authUser.id,
        name: profile?.full_name || metadataName || email.split("@")[0].replace(/[._-]/g, " "),
        email,
        role,
        branchId: profile?.branch_id || undefined,
        driverId: role === "driver" ? "drv-101" : undefined,
      });
      setAuthLoading(false);
    }

    async function loadInitialUser() {
      const { data } = await supabase.auth.getUser();
      await syncUser(data.user);
    }

    void loadInitialUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      void syncUser(session?.user || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("simba-cart", JSON.stringify(cart));
    localStorage.setItem("simba-theme", theme);
    localStorage.setItem("simba-accent", accent);
    localStorage.setItem("simba-currency", currency);
    localStorage.setItem("simba-branch", selectedBranchId);
    localStorage.setItem("simba-language", language);
    localStorage.setItem("simba-saved-products", JSON.stringify(savedProductIds));
    localStorage.setItem("simba-managed-products", JSON.stringify(managedProducts));
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.accent = accent;
    document.documentElement.lang = language;
  }, [cart, theme, accent, currency, selectedBranchId, language, savedProductIds, managedProducts, ready]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      return existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [...items, { product, quantity }];
    });
    setRecentAdds((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      const next = existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
        : [{ product, quantity }, ...items];
      return next.slice(0, 4);
    });
    setCartPanelOpen(true);
  };

  const value: StoreContextValue = {
    cart,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    recentAdds,
    cartPanelOpen,
    user,
    authLoading,
    theme,
    accent,
    currency,
    selectedBranchId,
    language,
    savedProductIds,
    managedProducts,
    addToCart,
    updateQuantity: (id, quantity) => setCart((items) => quantity <= 0
      ? items.filter((item) => item.product.id !== id)
      : items.map((item) => item.product.id === id ? { ...item, quantity } : item)),
    removeFromCart: (id) => setCart((items) => items.filter((item) => item.product.id !== id)),
    clearCart: () => {
      setCart([]);
      setRecentAdds([]);
      setCartPanelOpen(false);
    },
    closeCartPanel: () => setCartPanelOpen(false),
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
    },
    toggleTheme: () => setTheme((value) => value === "light" ? "dark" : "light"),
    setAccent: setAccentState,
    setCurrency: setCurrencyState,
    setSelectedBranchId: setSelectedBranchIdState,
    setLanguage: setLanguageState,
    t: (key) => translate(key as never, language) || key,
    toggleSavedProduct: (productId) => setSavedProductIds((items) =>
      items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]),
    addManagedProduct: (product) => setManagedProducts((items) => [product, ...items]),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
