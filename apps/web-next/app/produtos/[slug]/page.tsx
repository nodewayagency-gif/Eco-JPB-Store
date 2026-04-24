import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { findProductBySlug, formatBRL, productImagePath, productSlug, products } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export const revalidate = 900;

type ProductDetailProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: productSlug(product) }));
}

export async function generateMetadata({ params }: ProductDetailProps): Promise<Metadata> {
  const product = findProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Produto não encontrado",
      robots: { index: false, follow: false }
    };
  }

  const title = `${product.name} | JPB Store`;
  const description = product.description;
  const canonical = `/produtos/${params.slug}`;
  const image = productImagePath(product.image);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteConfig.url}${canonical}`,
      images: [{ url: image, width: 1200, height: 1200 }]
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [image]
    }
  };
}

export default function ProductDetailPage({ params }: ProductDetailProps) {
  const product = findProductBySlug(params.slug);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [`${siteConfig.url}${productImagePath(product.image)}`],
    description: product.description,
    brand: { "@type": "Brand", name: "JPB" },
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/produtos/${params.slug}`
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${siteConfig.url}/` },
      { "@type": "ListItem", position: 2, name: "Produtos", item: `${siteConfig.url}/produtos` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteConfig.url}/produtos/${params.slug}`
      }
    ]
  };

  return (
    <div className="container stack-lg">
      <ProductViewTracker product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="product-detail">
        <div className="product-visual">
          <Image
            src={productImagePath(product.image)}
            alt={product.name}
            width={640}
            height={640}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="stack-md">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price-lg">{formatBRL(product.price)}</p>
          <p className="muted">{product.description}</p>
          <AddToCartButton product={product} />

          <ul className="spec-list">
            {product.specs.map((spec) => (
              <li key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
