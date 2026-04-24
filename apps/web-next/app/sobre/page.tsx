import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a JPB Store: compromisso com performance, confiança de compra e experiência premium.",
  alternates: {
    canonical: "/sobre"
  }
};

export default function AboutPage() {
  return (
    <div className="container stack-lg">
      <section className="section-head-col">
        <p className="eyebrow">Sobre nós</p>
        <h1>Premium, agilidade e resultado</h1>
        <p className="muted">
          Construímos uma operação focada em experiência de compra, entrega confiável e produtos com alto padrão.
        </p>
      </section>

      <section className="trust-grid">
        <article><h3>Entrega nacional</h3><p>Logística preparada para escalar com cotação de frete futura.</p></article>
        <article><h3>Pagamentos integráveis</h3><p>Arquitetura pronta para gateway e fluxo de reconciliação.</p></article>
        <article><h3>Dados para decisão</h3><p>Medição de funil para otimização contínua de conversão.</p></article>
      </section>
    </div>
  );
}
