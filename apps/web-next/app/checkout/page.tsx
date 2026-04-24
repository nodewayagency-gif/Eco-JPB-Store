import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize sua compra com segurança, rapidez e acompanhamento do pedido.",
  alternates: {
    canonical: "/checkout"
  }
};

export default function CheckoutPage() {
  return (
    <div className="container stack-lg">
      <header className="section-head-col">
        <p className="eyebrow">Finalização segura</p>
        <h1>Checkout otimizado para conversão</h1>
        <p className="muted">Resumo claro, pagamento simples e sinais de confiança em toda a jornada.</p>
      </header>
      <CheckoutForm />
    </div>
  );
}
