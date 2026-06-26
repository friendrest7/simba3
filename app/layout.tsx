import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/components/store-provider";
import { DeferredUtilities } from "@/components/deferred-utilities";
import backgroundImage from "@/ogik.png";

export const metadata: Metadata = {
  title: "Simba Supermarket | Shop the world with trust",
  description: "High definition products, everyday essentials and Simba favourites delivered from our market to your door.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Simba",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#f0b323",
    "msapplication-TileImage": "/icon-192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#f0b323" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-canvas text-ink">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("simba-theme");const a=localStorage.getItem("simba-accent")||"yellow";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.accent=a}catch{}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))}`,
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
