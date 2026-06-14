"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CartAddedPanel = dynamic(() => import("./cart-added-panel").then((module) => module.CartAddedPanel), { ssr: false });
const MobileCartBar = dynamic(() => import("./mobile-cart-bar").then((module) => module.MobileCartBar), { ssr: false });
const PageTranslator = dynamic(() => import("./page-translator").then((module) => module.PageTranslator), { ssr: false });
const SimbaChat = dynamic(() => import("./simba-chat").then((module) => module.SimbaChat), { ssr: false });
const ThemePanel = dynamic(() => import("./theme-panel").then((module) => module.ThemePanel), { ssr: false });

export function DeferredUtilities() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 2_500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;
  return <>
    <PageTranslator />
    <CartAddedPanel />
    <MobileCartBar />
    <SimbaChat />
    <ThemePanel />
  </>;
}
