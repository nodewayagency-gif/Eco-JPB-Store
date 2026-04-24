"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@premium/contracts";
import { formatBRL, productHref, productImagePath } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={productHref(product)} className="product-image-link">
        <Image
          src={productImagePath(product.image)}
          alt={product.name}
          width={360}
          height={360}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
        />
      </Link>
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="price">{formatBRL(product.price)}</p>
        <Link href={productHref(product)} className="btn-secondary">
          Ver produto
        </Link>
      </div>
    </article>
  );
}
