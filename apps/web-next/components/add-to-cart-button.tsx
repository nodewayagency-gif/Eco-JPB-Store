"use client";

import { useTransition } from "react";
import type { Product } from "@premium/contracts";
import { useCart } from "@/context/cart-context";
import { trackEvent } from "@/lib/analytics";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();

  const onAdd = () => {
    startTransition(() => {
      addItem(product);
      trackEvent("add_to_cart", {
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
    });
  };

  return (
    <button type="button" onClick={onAdd} className="btn-primary" disabled={isPending}>
      {isPending ? "Adicionando..." : "Adicionar ao carrinho"}
    </button>
  );
}
