import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { DeferredUtilities } from "@/components/deferred-utilities";
import backgroundImage from "@/ogik.png";

export const metadata: Metadata = {
  title: "Simba Marketplace | Shop the world with trust",
  description: "High definition products, everyday essentials and Simba favourites delivered from our market to your door.",
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
        <div
          className="site-background"
          style={{ backgroundImage: `url(${backgroundImage.src})` }}
          aria-hidden="true"
        />
        <StoreProvider>
          <div className="site-shell">
            <Header />
            <main>{children}</main>
            <Footer />
            <DeferredUtilities />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
