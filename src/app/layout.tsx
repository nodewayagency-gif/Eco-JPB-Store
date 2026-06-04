import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JPBStoreX | Acessórios e Eletrônicos Premium",
  description: "A melhor experiência com produtos premium. Especialistas em acessórios e eletrônicos que todo mundo já quis ter.",
  metadataBase: new URL("https://www.jpbstorex.com.br"),
  openGraph: {
    title: "JPBStoreX | Acessórios e Eletrônicos Premium",
    description: "A melhor experiência com produtos premium. Especialistas em acessórios e eletrônicos que todo mundo já quis ter.",
    url: "https://www.jpbstorex.com.br",
    siteName: "JPBStoreX",
    images: [
      {
        url: "/logo.png", // Imagem padrão
        width: 1200,
        height: 630,
        alt: "JPBStoreX",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
