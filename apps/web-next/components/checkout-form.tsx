"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useCart } from "@/context/cart-context";
import { formatBRL } from "@/lib/products";
import { trackEvent } from "@/lib/analytics";

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [done, setDone] = useState(false);
  const beginCheckoutTracked = useRef(false);

  useEffect(() => {
    if (items.length === 0) {
      beginCheckoutTracked.current = false;
      return;
    }
    if (beginCheckoutTracked.current) return;
    beginCheckoutTracked.current = true;
    trackEvent("begin_checkout", {
      currency: "BRL",
      value: total,
      items: items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
  }, [items, total]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    trackEvent("add_payment_info", {
      currency: "BRL",
      value: total,
      items: items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }))
    });

    const transactionId = `JPB-${Date.now()}`;

    trackEvent("purchase", {
      currency: "BRL",
      value: total,
      transaction_id: transactionId,
      items: items.map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }))
    });

    setDone(true);
    clearCart();
  };

  if (done) {
    return (
      <section className="checkout-success">
        <h2>Pedido confirmado</h2>
        <p>Pagamento registrado com sucesso. Você receberá atualizações por e-mail.</p>
      </section>
    );
  }

  return (
    <form className="checkout-grid" onSubmit={handleSubmit}>
      <section className="panel">
        <h2>Dados de entrega</h2>
        <div className="form-grid">
          <input required placeholder="Nome completo" />
          <input required type="email" placeholder="E-mail" />
          <input required placeholder="CEP" />
          <input required placeholder="Endereço" />
          <input required placeholder="Número" />
          <input placeholder="Complemento" />
        </div>

        <h3>Pagamento</h3>
        <div className="chip-row">
          {["pix", "cartao", "boleto"].map((method) => (
            <button
              type="button"
              key={method}
              className={paymentMethod === method ? "chip active" : "chip"}
              onClick={() => setPaymentMethod(method)}
            >
              {method.toUpperCase()}
            </button>
          ))}
        </div>

        <button type="submit" className="btn-primary">Finalizar compra</button>
      </section>

      <aside className="panel sticky-summary">
        <h2>Resumo do pedido</h2>
        <ul className="summary-list">
          {items.map((item) => (
            <li key={item.product.id}>
              <span>{item.product.name} x{item.quantity}</span>
              <strong>{formatBRL(item.product.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatBRL(total)}</strong>
        </div>
        <p className="trust">Compra segura, dados protegidos e entrega rastreada.</p>
      </aside>
    </form>
  );
}
