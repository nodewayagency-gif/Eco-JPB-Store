import type { Metadata } from "next";
import { ProductCatalog } from "@/components/product-catalog";
import { productHref, products } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo de eletrônicos premium da JPB Store com headphones, earbuds, speakers e smartwatches.",
  alternates: {
    canonical: "/produtos"
  }
};

export default function ProductsPage() {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}${productHref(product)}`,
      name: product.name
    }))
  };

  return (
    <div className="container stack-lg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <header className="section-head-col">
        <p className="eyebrow">Catálogo</p>
        <h1>Nossos Produtos</h1>
        <p className="muted">Busque, filtre e encontre o produto ideal para sua necessidade.</p>
      </header>
      <ProductCatalog products={products} />
    </div>
  );
}
