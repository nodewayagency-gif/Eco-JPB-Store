"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@premium/contracts";
import { ProductCard } from "@/components/product-card";
import { trackEvent } from "@/lib/analytics";

type ProductCatalogProps = {
  products: Product[];
};

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const byCategory = category === "Todos" || product.category === category;
      const byQuery = normalized.length === 0 || product.name.toLowerCase().includes(normalized);
      return byCategory && byQuery;
    });
  }, [products, query, category]);

  useEffect(() => {
    trackEvent("view_item_list", {
      currency: "BRL",
      items: filtered.map((product) => ({
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price
      }))
    });
  }, [filtered]);

  return (
    <>
      <div className="catalog-filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome"
          aria-label="Buscar produtos"
        />
        <div className="chip-row">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "chip active" : "chip"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
