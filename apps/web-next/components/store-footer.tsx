import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">JPB Store</p>
          <p className="muted">Eletrônicos premium com confiança e performance.</p>
        </div>

        <div className="footer-links">
          <Link href="/">Início</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/sobre">Sobre</Link>
        </div>

        <p className="muted">
          Desenvolvido por {" "}
          <a href="https://bitwiseagency.com.br/" target="_blank" rel="noreferrer">
            Bitwise Agency
          </a>
        </p>
      </div>
    </footer>
  );
}
