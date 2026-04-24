import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: {
    index: false,
    follow: false
  }
};

export default function CustomerPage() {
  return (
    <div className="container stack-md">
      <h1>Minha conta</h1>
      <p className="muted">Área autenticada em migração faseada para o novo storefront.</p>
    </div>
  );
}
