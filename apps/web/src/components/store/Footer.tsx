import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/jpb_sem_fundo_32x32.png" alt="JPB Store" className="h-8 w-8 object-contain" />
            <div>
              <p className="text-sm font-semibold gold-text">JPB STORE</p>
              <p className="text-xs text-muted-foreground">© {year} JPB Store. Todos os direitos reservados.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</Link>
            <Link to="/produtos" className="text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
            <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            Desenvolvido por <a href="https://bitwiseagency.com.br/" target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 transition-colors">Bitwise Agency</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
