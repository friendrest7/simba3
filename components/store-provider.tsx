"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthChangeEvent, Session, SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";
import { branches, CurrencyCode, Product } from "@/lib/data";
import { LanguageCode, languageCodes, translate } from "@/lib/i18n";

export type CartItem = { product: Product; quantity: number };
export type User = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin" | "manager" | "driver" | "ceo";
  branchId?: string;
  driverId?: string;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  paymentId?: string;
  providerReference?: string;
  paymentStatus: string;
  orderStatus: string;
  totalRwf: number;
  deliveryFeeRwf: number;
  estimatedDeliveryAt: string;
  demoPayment?: boolean;
  items: Array<{ name: string; quantity: number; price: number }>;
};

export type Accent =
  | "red"
  | "green"
  | "blue"
  | "purple"
  | "amber"
  | "teal"
  | "orange"
  | "pink"
  | "rose"
  | "fuchsia"
  | "violet"
  | "indigo"
  | "cyan"
  | "sky"
  | "emerald"
  | "lime"
  | "yellow"
  | "brown"
  | "slate"
  | "black";
export type { LanguageCode } from "@/lib/i18n";

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  recentAdds: CartItem[];
  cartPanelOpen: boolean;
  savedForLater: CartItem[];
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
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeFromSaved: (id: string) => void;
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
  const [accent, setAccentState] = useState<Accent>("yellow");
  const [currency, setCurrencyState] = useState<CurrencyCode>("RWF");
  const [selectedBranchId, setSelectedBranchIdState] = useState("kigali-kic");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [managedProducts, setManagedProducts] = useState<Product[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [accountStateReady, setAccountStateReady] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("simba-cart");
    const savedTheme = localStorage.getItem("simba-theme") as "light" | "dark" | null;
    const savedAccent = localStorage.getItem("simba-accent") as Accent | null;
    const savedCurrency = localStorage.getItem("simba-currency") as CurrencyCode | null;
    const savedBranchId = localStorage.getItem("simba-branch");
    const savedLanguage = localStorage.getItem("simba-language") as LanguageCode | null;
    const savedProducts = localStorage.getItem("simba-saved-products");
    const savedManagedProducts = localStorage.getItem("simba-managed-products");
    const savedForLaterRaw = localStorage.getItem("simba-saved-for-later");

    try {
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedProducts) setSavedProductIds(JSON.parse(savedProducts));
      if (savedManagedProducts) setManagedProducts(JSON.parse(savedManagedProducts));
      if (savedForLaterRaw) setSavedForLater(JSON.parse(savedForLaterRaw));
    } catch {
      localStorage.removeItem("simba-cart");
      localStorage.removeItem("simba-saved-products");
      localStorage.removeItem("simba-managed-products");
      localStorage.removeItem("simba-saved-for-later");
    }    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    if (savedAccent) setAccentState(savedAccent);
    if (savedCurrency && Object.hasOwn({ RWF: true, ZAR: true, USD: true, EUR: true, GBP: true, BWP: true }, savedCurrency)) setCurrencyState(savedCurrency);
    if (savedBranchId && branches.some((branch) => branch.id === savedBranchId)) setSelectedBranchIdState(savedBranchId);
    if (savedLanguage && languageCodes.includes(savedLanguage)) setLanguageState(savedLanguage);
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    const needsImmediateAuth = /^\/(account|checkout|dashboard|signin|signup|forgot-password|reset-password)(\/|$)/.test(window.location.pathname);

    async function loadSupabase() {
      const { createClient } = await import("@/lib/supabase/client");
      if (!active) return;
      setSupabase(createClient());
      setSupabaseReady(true);
    }

    const timer = window.setTimeout(() => void loadSupabase(), needsImmediateAuth ? 0 : 4000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!supabaseReady) return;
    if (!supabase) {
      console.error("Supabase public environment variables are not configured.");
      setAuthLoading(false);
      return;
    }
    const client = supabase;

    let active = true;

    async function syncUser(authUser: SupabaseUser | null) {
      if (!active) return;
      if (!authUser) {
        setUser(null);
        setAccountStateReady(false);
        setAuthLoading(false);
        return;
      }

      const { data: profile } = await client
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
      const { data } = await client.auth.getUser();
      await syncUser(data.user);
    }

    void loadInitialUser();
    const { data: listener } = client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      void syncUser(session?.user || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, supabaseReady]);

  useEffect(() => {
    if (!ready || !user || accountStateReady) return;
    let active = true;

    async function loadAccountState() {
      try {
        const response = await fetch("/api/account/state");
        const data = response.ok
          ? await response.json() as { cart?: Array<{ productId: string; quantity: number }>; wishlist?: string[] }
          : null;
        const productIds = Array.from(new Set((data?.cart || []).map((item) => item.productId)));
        const productResponse = productIds.length > 0
          ? await fetch(`/api/products?ids=${encodeURIComponent(productIds.join(","))}&pageSize=${Math.min(96, productIds.length)}`)
          : null;
        const productData = productResponse?.ok
          ? await productResponse.json() as { products?: Product[] }
          : null;

        if (!active) return;
        const productMap = new Map((productData?.products || []).map((product) => [product.id, product]));
        setCart((localCart) => {
          const merged = new Map(localCart.map((item) => [item.product.id, item]));
          for (const savedItem of data?.cart || []) {
            const product = productMap.get(savedItem.productId);
            if (!product) continue;
            const existing = merged.get(product.id);
            merged.set(product.id, {
              product,
              quantity: Math.max(existing?.quantity || 0, Math.min(product.stock, savedItem.quantity)),
            });
          }
          return Array.from(merged.values()).filter((item) => item.quantity > 0);
        });
        setSavedProductIds((localIds) => Array.from(new Set([...localIds, ...(data?.wishlist || [])])));
      } catch {
        // Local state remains fully functional if the optional sync migration is unavailable.
      } finally {
        if (active) setAccountStateReady(true);
      }
    }

    void loadAccountState();

    return () => {
      active = false;
    };
  }, [accountStateReady, ready, user]);

  useEffect(() => {
    if (!ready || !user || !accountStateReady) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/account/state", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          wishlist: savedProductIds,
        }),
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [accountStateReady, cart, ready, savedProductIds, user]);

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
    localStorage.setItem("simba-saved-for-later", JSON.stringify(savedForLater));
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.accent = accent;
    document.documentElement.lang = language;
  }, [cart, theme, accent, currency, selectedBranchId, language, savedProductIds, managedProducts, savedForLater, ready]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      return existing
        ? items.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item)
        : [...items, { product, quantity: Math.min(product.stock, Math.max(1, quantity)) }];
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
    savedForLater,
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
    saveForLater: (id) => {
      const item = cart.find((c) => c.product.id === id);
      if (!item) return;
      setCart((items) => items.filter((c) => c.product.id !== id));
      setSavedForLater((items) => items.some((c) => c.product.id === id) ? items : [...items, item]);
    },
    moveToCart: (id) => {
      const item = savedForLater.find((c) => c.product.id === id);
      if (!item) return;
      setSavedForLater((items) => items.filter((c) => c.product.id !== id));
      setCart((items) => {
        const existing = items.find((c) => c.product.id === id);
        return existing ? items.map((c) => c.product.id === id ? { ...c, quantity: Math.min(c.product.stock, c.quantity + item.quantity) } : c) : [...items, item];
      });
    },
    removeFromSaved: (id) => setSavedForLater((items) => items.filter((c) => c.product.id !== id)),
    signOut: async () => {
      if (supabase) await supabase.auth.signOut();
      setUser(null);
      setAccountStateReady(false);
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
