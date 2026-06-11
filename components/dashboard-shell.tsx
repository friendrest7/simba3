"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, Building2, ClipboardList, Globe2, LayoutDashboard, LogOut, PackageSearch, Settings, ShieldCheck, ShoppingBag, TrendingUp, Truck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useStore } from "./store-provider";

const menu = {
  client: [[LayoutDashboard, "Overview"], [ShoppingBag, "My orders"], [PackageSearch, "Track deliveries"], [Settings, "Settings"]],
  admin: [[LayoutDashboard, "Overview"], [Users, "Users"], [Boxes, "Products"], [ClipboardList, "Orders"], [Settings, "Settings"]],
  manager: [[LayoutDashboard, "Overview"], [Boxes, "Stock"], [Truck, "Deliveries"], [BarChart3, "Sales"], [Settings, "Settings"]],
  driver: [[LayoutDashboard, "My route"], [Truck, "Deliveries"], [PackageSearch, "Location reporting"], [Settings, "Settings"]],
  ceo: [[Globe2, "Africa overview"], [Building2, "Country markets"], [TrendingUp, "Growth"], [ShieldCheck, "Risk"], [Settings, "Settings"]],
};

const dashboardTitles = {
  client: { eyebrow: "client workspace", title: "Client dashboard" },
  admin: { eyebrow: "admin workspace", title: "Admin dashboard" },
  manager: { eyebrow: "manager workspace", title: "Manager dashboard" },
  driver: { eyebrow: "driver workspace", title: "Driver dashboard" },
  ceo: { eyebrow: "Africa executive workspace", title: "CEO dashboard" },
};

export function DashboardShell({ role, children }: { role: "client" | "admin" | "manager" | "driver" | "ceo"; children: React.ReactNode }) {
  const { user, authLoading, signOut, t } = useStore();
  const defaultTool = String(menu[role][0][1]);
  const [activeTool, setActiveTool] = useState(defaultTool);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    else if (user.role !== role) router.replace(`/dashboard/${user.role}`);
  }, [user, authLoading, role, router, pathname]);
  if (authLoading || !user || user.role !== role) return <div className="min-h-[70vh] py-24 text-center text-sm text-muted">Verifying dashboard access...</div>;

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#18191c] dark:bg-[#151619] dark:text-white">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1b1c20] lg:flex lg:flex-col">
          <Logo />
          <div className="mt-10"><p className="px-3 text-[10px] font-black uppercase text-gray-400">Workspace</p><nav className="mt-3 space-y-1">{menu[role].map(([Icon, label]) => <button type="button" key={String(label)} onClick={() => { setActiveTool(String(label)); document.getElementById("dashboard-content")?.scrollIntoView({ behavior: "smooth" }); }} className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-bold transition ${activeTool === String(label) ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"}`}><Icon className="h-4 w-4" />{String(label)}</button>)}</nav></div>
          <div className="mt-auto border-t border-black/10 pt-5 dark:border-white/10"><div className="px-3"><p className="text-sm font-black capitalize">{user.name}</p><p className="mt-1 text-xs text-gray-400">{user.email}</p></div><button onClick={async () => { await signOut(); router.push("/"); router.refresh(); }} className="mt-4 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold text-gray-500 hover:text-brand"><LogOut className="h-4 w-4" /> {t("signout")}</button></div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-black/10 bg-white px-5 dark:border-white/10 dark:bg-[#1b1c20] sm:px-8"><div><p className="text-[10px] font-black uppercase text-brand">{dashboardTitles[role].eyebrow}</p><h1 className="mt-1 text-lg font-black">{dashboardTitles[role].title}</h1></div><div className="flex items-center gap-3"><Link href="/shop" className="text-xs font-bold text-gray-500 hover:text-brand">Go to marketplace</Link><span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-black text-white">{user.name.slice(0, 2).toUpperCase()}</span></div></header>
          <div id="dashboard-content" className="p-5 sm:p-8">
            {activeTool !== defaultTool && <div className="mb-5 flex items-center justify-between rounded-md border border-brand/20 bg-brand/5 px-4 py-3"><div><p className="text-xs font-black text-brand">{activeTool}</p><p className="mt-1 text-[11px] text-gray-500">Showing the relevant live operations available in this dashboard.</p></div><button type="button" onClick={() => setActiveTool(defaultTool)} className="text-xs font-black text-brand">Back to overview</button></div>}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
