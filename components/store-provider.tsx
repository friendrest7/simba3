"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { branches, CurrencyCode, Product } from "@/lib/data";

export type CartItem = { product: Product; quantity: number };
type User = { name: string; email: string; role: "client" | "admin" | "manager" | "driver" | "ceo"; branchId?: string; driverId?: string };
export type Accent = "red" | "green" | "blue" | "purple" | "amber" | "teal";
export type LanguageCode = "en" | "fr" | "sw" | "am" | "tr" | "zh";

const translations: Record<LanguageCode, Record<string, string>> = {
  en: { marketplace: "Marketplace", deals: "Fresh deals", track: "Track order", dashboards: "Dashboards", search: "Search milk, bread, rice, Simba chips...", signin: "Sign in", signout: "Sign out", home: "Home", language: "Language" },
  fr: { marketplace: "Marché", deals: "Offres fraîches", track: "Suivre la commande", dashboards: "Tableaux de bord", search: "Rechercher lait, pain, riz, chips Simba...", signin: "Se connecter", signout: "Se déconnecter", home: "Accueil", language: "Langue" },
  sw: { marketplace: "Soko", deals: "Ofa mpya", track: "Fuatilia oda", dashboards: "Dashibodi", search: "Tafuta maziwa, mkate, mchele, chips za Simba...", signin: "Ingia", signout: "Toka", home: "Nyumbani", language: "Lugha" },
  am: { marketplace: "ገበያ", deals: "አዲስ ቅናሾች", track: "ትዕዛዝ ይከታተሉ", dashboards: "ዳሽቦርዶች", search: "ወተት፣ ዳቦ፣ ሩዝ እና ሌሎችን ይፈልጉ...", signin: "ይግቡ", signout: "ይውጡ", home: "መነሻ", language: "ቋንቋ" },
  tr: { marketplace: "Market", deals: "Taze fırsatlar", track: "Siparişi takip et", dashboards: "Panolar", search: "Süt, ekmek, pirinç ve Simba cips ara...", signin: "Giriş yap", signout: "Çıkış yap", home: "Ana sayfa", language: "Dil" },
  zh: { marketplace: "市场", deals: "新鲜优惠", track: "追踪订单", dashboards: "仪表板", search: "搜索牛奶、面包、大米和 Simba 薯片...", signin: "登录", signout: "退出", home: "首页", language: "语言" },
};

type StoreContextValue = {
  cart: CartItem[];
  cartCount: number;
  recentAdds: CartItem[];
  cartPanelOpen: boolean;
  user: User | null;
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
  signIn: (email: string, role?: User["role"], branchId?: string) => void;
  signOut: () => void;
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentAdds, setRecentAdds] = useState<CartItem[]>([]);
  const [cartPanelOpen, setCartPanelOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accent, setAccentState] = useState<Accent>("amber");
  const [currency, setCurrencyState] = useState<CurrencyCode>("RWF");
  const [selectedBranchId, setSelectedBranchIdState] = useState("kigali-kic");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [managedProducts, setManagedProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("simba-cart");
    const savedUser = localStorage.getItem("simba-user");
    const savedTheme = localStorage.getItem("simba-theme") as "light" | "dark" | null;
    const savedAccent = localStorage.getItem("simba-accent") as Accent | null;
    const savedCurrency = localStorage.getItem("simba-currency") as CurrencyCode | null;
    const savedBranchId = localStorage.getItem("simba-branch");
    const savedLanguage = localStorage.getItem("simba-language") as LanguageCode | null;
    const savedProducts = localStorage.getItem("simba-saved-products");
    const savedManagedProducts = localStorage.getItem("simba-managed-products");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccentState(savedAccent);
    if (savedCurrency === "RWF") setCurrencyState(savedCurrency);
    else setCurrencyState("RWF");
    if (savedBranchId && branches.some((branch) => branch.id === savedBranchId)) {
      setSelectedBranchIdState(savedBranchId);
    } else {
      setSelectedBranchIdState("kigali-kic");
    }
    if (savedLanguage && translations[savedLanguage]) setLanguageState(savedLanguage);
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) setSavedProductIds(parsed.filter((id): id is string => typeof id === "string"));
      } catch {
        localStorage.removeItem("simba-saved-products");
      }
    }
    if (savedManagedProducts) {
      try {
        const parsed = JSON.parse(savedManagedProducts);
        if (Array.isArray(parsed)) setManagedProducts(parsed);
      } catch {
        localStorage.removeItem("simba-managed-products");
      }
    }
    setReady(true);
  }, []);

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
    if (user) localStorage.setItem("simba-user", JSON.stringify(user));
    else localStorage.removeItem("simba-user");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.accent = accent;
    document.documentElement.lang = language;
  }, [cart, user, theme, accent, currency, selectedBranchId, language, savedProductIds, managedProducts, ready]);

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
    theme,
    accent,
    currency,
    selectedBranchId,
    language,
    savedProductIds,
    managedProducts,
    addToCart,
    updateQuantity: (id, quantity) => setCart((items) =>
      quantity <= 0
        ? items.filter((item) => item.product.id !== id)
        : items.map((item) => item.product.id === id ? { ...item, quantity } : item)
    ),
    removeFromCart: (id) => setCart((items) => items.filter((item) => item.product.id !== id)),
    clearCart: () => {
      setCart([]);
      setRecentAdds([]);
      setCartPanelOpen(false);
    },
    closeCartPanel: () => setCartPanelOpen(false),
    signIn: (email, role = "client", branchId) => setUser({
      name: email.split("@")[0].replace(/[._-]/g, " "),
      email,
      role,
      branchId: role === "manager" ? (branchId || "kigali-kic") : role === "driver" ? (branchId || "kigali-kic") : undefined,
      driverId: role === "driver" ? "drv-101" : undefined,
    }),
    signOut: () => setUser(null),
    toggleTheme: () => setTheme((value) => value === "light" ? "dark" : "light"),
    setAccent: setAccentState,
    setCurrency: setCurrencyState,
    setSelectedBranchId: setSelectedBranchIdState,
    setLanguage: setLanguageState,
    t: (key) => translations[language][key] || translations.en[key] || key,
    toggleSavedProduct: (productId) => setSavedProductIds((items) =>
      items.includes(productId) ? items.filter((id) => id !== productId) : [...items, productId]
    ),
    addManagedProduct: (product) => setManagedProducts((items) => [product, ...items]),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
