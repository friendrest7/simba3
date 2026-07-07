"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Building2, ClipboardList, Globe2, LayoutDashboard, LogOut, PackageSearch, Settings, ShieldCheck, ShoppingBag, TrendingUp, Truck, Users } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logo } from "./logo";
import { useStore } from "./store-provider";

// Menu keys map to translation keys so the sidebar labels are fully translated
type MenuKey =
  | "menuOverview" | "menuMyOrders" | "menuTrackDeliveries" | "menuSettings"
  | "menuUsers" | "menuProducts" | "menuOrders" | "menuStock" | "menuDeliveries"
  | "menuSales" | "menuMyRoute" | "menuLocationReporting"
  | "menuAfricaOverview" | "menuCountryMarkets" | "menuGrowth" | "menuRisk";

// We keep the English label as the identifier so useActiveTool() callers can do
// `activeTool === "Settings"` etc., but the *display* label is translated.
type MenuEntry = [React.ElementType, MenuKey, string]; // [Icon, translationKey, englishId]

const menu: Record<string, MenuEntry[]> = {
  client: [
    [LayoutDashboard, "menuOverview", "Overview"],
    [ShoppingBag, "menuMyOrders", "My orders"],
    [PackageSearch, "menuTrackDeliveries", "Track deliveries"],
    [Settings, "menuSettings", "Settings"],
  ],
  admin: [
    [LayoutDashboard, "menuOverview", "Overview"],
    [Users, "menuUsers", "Users"],
    [Boxes, "menuProducts", "Products"],
    [ClipboardList, "menuOrders", "Orders"],
    [Settings, "menuSettings", "Settings"],
  ],
  manager: [
    [LayoutDashboard, "menuOverview", "Overview"],
    [Boxes, "menuStock", "Stock"],
    [Truck, "menuDeliveries", "Deliveries"],
    [BarChart3, "menuSales", "Sales"],
    [Settings, "menuSettings", "Settings"],
  ],
  driver: [
    [LayoutDashboard, "menuMyRoute", "My route"],
    [Truck, "menuDeliveries", "Deliveries"],
    [PackageSearch, "menuLocationReporting", "Location reporting"],
    [Settings, "menuSettings", "Settings"],
  ],
  ceo: [
    [Globe2, "menuAfricaOverview", "Africa overview"],
    [Building2, "menuCountryMarkets", "Country markets"],
    [TrendingUp, "menuGrowth", "Growth"],
    [ShieldCheck, "menuRisk", "Risk"],
    [Settings, "menuSettings", "Settings"],
  ],
};

type WorkspaceKey = "clientWorkspace" | "adminWorkspace" | "managerWorkspace" | "driverWorkspace" | "ceoWorkspace";
type TitleKey = "clientDashboard" | "adminDashboard" | "managerDashboard" | "driverDashboard" | "ceoDashboard";

const dashboardKeys: Record<string, { eyebrow: WorkspaceKey; title: TitleKey }> = {
  client:  { eyebrow: "clientWorkspace",  title: "clientDashboard"  },
  admin:   { eyebrow: "adminWorkspace",   title: "adminDashboard"   },
  manager: { eyebrow: "managerWorkspace", title: "managerDashboard" },
  driver:  { eyebrow: "driverWorkspace",  title: "driverDashboard"  },
  ceo:     { eyebrow: "ceoWorkspace",     title: "ceoDashboard"     },
};

// ActiveToolContext holds the English id so all existing callers keep working
export const ActiveToolContext = createContext<string>("");

export function useActiveTool() {
  return useContext(ActiveToolContext);
}

export function DashboardShell({ role, children }: { role: "client" | "admin" | "manager" | "driver" | "ceo"; children: React.ReactNode }) {
  const { user, authLoading, signOut, t } = useStore();
  const defaultTool = menu[role][0][2]; // English id
  const [activeTool, setActiveTool] = useState(defaultTool);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(`/dashboard/${user.role}`);
  }, [user, authLoading, role, router, pathname]);

  if (authLoading || !user || user.role !== role) {
    return <div className="min-h-[70vh] py-24 text-center text-sm text-muted">{t("verifyingAccess")}</div>;
  }

  const keys = dashboardKeys[role];

  return (
    <ActiveToolContext.Provider value={activeTool}>
      <div className="min-h-screen bg-[#f5f5f3] text-[#18191c] dark:bg-[#151619] dark:text-white">
        <div className="mx-auto flex max-w-[1600px]">
          {/* Sidebar */}
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1b1c20] lg:flex lg:flex-col">
            <Logo />
            <div className="mt-10">
              <p className="px-3 text-[10px] font-black uppercase text-gray-400">{t("workspace")}</p>
              <nav className="mt-3 space-y-1">
                {menu[role].map(([Icon, tKey, id]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      setActiveTool(id);
                      document.getElementById("dashboard-content")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                      activeTool === id ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(tKey)}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mt-auto border-t border-black/10 pt-5 dark:border-white/10">
              <div className="px-3">
                <p className="text-sm font-black capitalize">{user.name}</p>
                <p className="mt-1 text-xs text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}
                className="mt-4 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-gray-500 hover:text-brand"
              >
                <LogOut className="h-4 w-4" /> {t("signout")}
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <header className="flex h-20 items-center justify-between border-b border-black/10 bg-white px-5 dark:border-white/10 dark:bg-[#1b1c20] sm:px-8">
              <div>
                <p className="text-[10px] font-black uppercase text-brand">{t(keys.eyebrow)}</p>
                <h1 className="mt-1 text-lg font-black">{t(keys.title)}</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/shop" className="text-xs font-bold text-gray-500 hover:text-brand">{t("goToMarketplace")}</Link>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-black text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </header>

            {/* Mobile nav tabs */}
            <div className="flex overflow-x-auto border-b border-black/10 bg-white dark:border-white/10 dark:bg-[#1b1c20] lg:hidden">
              {menu[role].map(([Icon, tKey, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTool(id)}
                  className={`flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
                    activeTool === id ? "border-brand text-brand" : "border-transparent text-gray-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />{t(tKey)}
                </button>
              ))}
            </div>

            <div id="dashboard-content" className="p-5 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ActiveToolContext.Provider>
  );
}
