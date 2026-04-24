import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container stack-md notfound">
      <h1>Página não encontrada</h1>
      <p className="muted">O conteúdo solicitado não está disponível.</p>
      <Link href="/" className="btn-primary">Voltar para a home</Link>
    </div>
  );
}
