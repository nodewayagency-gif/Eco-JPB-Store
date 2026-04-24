"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/minha-conta", label: "Minha conta" }
];

export function StoreHeader() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <header className="header">
      <div className="container nav-wrap">
        <Link href="/" className="brand">
          <img src="/jpb_sem_fundo_32x32.png" alt="JPB Store" width="28" height="28" />
          <span>JPB STORE</span>
        </Link>

        <nav className="nav-links" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
          <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com"} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </nav>

        <Link href="/checkout" className="cart-pill" aria-label="Abrir checkout">
          Carrinho ({totalItems})
        </Link>
      </div>
    </header>
  );
}
