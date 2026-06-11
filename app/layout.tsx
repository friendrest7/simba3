import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { SimbaChat } from "@/components/simba-chat";
import { CartAddedPanel } from "@/components/cart-added-panel";
import { PageTranslator } from "@/components/page-translator";
import { ThemePanel } from "@/components/theme-panel";

export const metadata: Metadata = {
  title: "Simba Marketplace | Shop the world with trust",
  description: "Shop high definition products and Simba favourites from Rwanda branches with secure checkout and trackable delivery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-canvas text-ink">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("simba-theme");document.documentElement.classList.toggle("dark",t==="dark")}catch{}`,
          }}
        />
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
