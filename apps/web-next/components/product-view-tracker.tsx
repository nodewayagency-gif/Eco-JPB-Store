"use client";

import { useEffect } from "react";
import type { Product } from "@premium/contracts";
import { trackEvent } from "@/lib/analytics";

export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    trackEvent("view_item", {
      currency: "BRL",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: 1
        }
      ]
    });
  }, [product]);

  return null;
}
