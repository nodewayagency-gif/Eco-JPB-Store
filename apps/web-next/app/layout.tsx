import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { Providers } from "@/components/providers";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/jpb_sem_fundo_32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/jpb_sem_fundo.png", sizes: "500x500", type: "image/png" }
    ],
    apple: [{ url: "/jpb_sem_fundo.png", sizes: "500x500", type: "image/png" }]
  },
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.defaultOgImage, width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.defaultOgImage]
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/jpb_sem_fundo.png`,
  sameAs: [siteConfig.instagramUrl]
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/produtos?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AnalyticsScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <Providers>
          <div className="app-shell">
            <StoreHeader />
            <main className="main-content">{children}</main>
            <StoreFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
