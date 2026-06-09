import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { ThemePanel } from "@/components/theme-panel";
import { SimbaChat } from "@/components/simba-chat";
import { CartAddedPanel } from "@/components/cart-added-panel";
import { PageTranslator } from "@/components/page-translator";

export const metadata: Metadata = {
  title: "Simba Marketplace | Shop the world with trust",
  description: "Shop fresh groceries and Simba favourites from Rwanda branches with secure checkout and trackable delivery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <StoreProvider>
          <PageTranslator />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartAddedPanel />
          <SimbaChat />
          <ThemePanel />
        </StoreProvider>
      </body>
    </html>
  );
}
