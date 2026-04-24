import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/products";

export const revalidate = 3600;

export default function HomePage() {
  const featured = products.slice(0, 3);

  return (
    <div className="container stack-xl">
      <section className="hero">
        <div>
          <p className="eyebrow">Destaque em áudio premium</p>
          <h1>O Som Perfeito para converter confiança em compra.</h1>
          <p className="muted">
            Catálogo premium com entrega nacional, checkout rápido e experiência focada em conversão.
          </p>
          <Link href="/produtos" className="btn-primary">Explorar catálogo</Link>
        </div>
        <div className="hero-media">
          <Image src="/jpb_sem_fundo.png" alt="Logo JPB Store" width={520} height={520} priority sizes="(max-width: 768px) 70vw, 520px" />
        </div>
      </section>

      <section className="trust-grid">
        <article><h3>Qualidade certificada</h3><p>Produtos validados e suporte dedicado.</p></article>
        <article><h3>5 mil clientes</h3><p>Base ativa e recorrente em todo o Brasil.</p></article>
        <article><h3>Checkout seguro</h3><p>Fluxo otimizado para reduzir abandono.</p></article>
      </section>

      <section className="stack-md">
        <div className="section-head">
          <h2>Seleção de performance</h2>
          <Link href="/produtos">Ver catálogo completo</Link>
        </div>
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
