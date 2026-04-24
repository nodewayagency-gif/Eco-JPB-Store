import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <div className="container stack-md">
      <h1>Painel Admin</h1>
      <p className="muted">Área privada isolada de indexação pública.</p>
    </div>
  );
}
