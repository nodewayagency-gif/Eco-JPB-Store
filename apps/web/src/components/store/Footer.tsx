import { Link } from "react-router-dom";
import { useConfig } from "@/providers/ConfigContext";
import logo from "@/assets/brand/jpb_sem_fundo_32x32.png";

const Footer = () => {
  const { config } = useConfig();
  const year = new Date().getFullYear();
  const companyName = config?.companyName || "JPB STORE";

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt={companyName} className="h-8 w-8 object-contain" />
            <div>
              <p className="text-sm font-semibold gold-text uppercase">{companyName}</p>
              <p className="text-xs text-muted-foreground">© {year} {companyName}. Todos os direitos reservados.</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</Link>
            <Link to="/produtos" className="text-muted-foreground hover:text-foreground transition-colors">Produtos</Link>
            <Link to="/sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</Link>
            <a 
              href={config?.instagramUrl || "https://www.instagram.com"} 
              target="_blank" 
              rel="noreferrer" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </a>
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
