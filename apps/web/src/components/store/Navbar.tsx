import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, User, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/providers/CartContext";
import { useAuth } from "@/providers/auth/AuthProvider";
import { useConfig } from "@/providers/ConfigContext";
import { CartSheet } from "./CartSheet";
import logo from "@/assets/brand/jpb_sem_fundo_32x32.png";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { customerSession, isCustomerAuthenticated } = useAuth();
  const { config } = useConfig();

  const userName = customerSession?.user.displayName;
  const instagramUrl = config?.instagramUrl || "https://www.instagram.com";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logo} alt="JPB Store" className="relative h-10 w-10 object-contain transition-transform duration-500 group-hover:scale-110" />
              </div>
              <span className="hidden sm:inline text-xl font-black tracking-tight gold-text">JPB STORE</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <Link to="/" className="relative text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 group">
                Início
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link to="/produtos" className="relative text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 group">
                Produtos
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link to="/sobre" className="relative text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 group">
                Sobre
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link to="/login" className="relative text-sm font-bold text-muted-foreground hover:text-foreground transition-colors duration-300 group">
                Minha conta
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
              </Link>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      className="w-full bg-secondary text-sm rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-foreground" />
              </a>

              <button
                onClick={() => setSearchOpen((value) => !value)}
                className="hidden sm:flex p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label="Buscar"
              >
                {searchOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Search className="h-5 w-5 text-foreground" />
                )}
              </button>

              {isCustomerAuthenticated && userName ? (
                <Link
                  to="/minha-conta"
                  className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground hover:border-primary/40 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-primary" />
                  {userName}
                </Link>
              ) : (
                <Link to="/login" className="hidden md:flex p-2 rounded-lg hover:bg-secondary transition-colors duration-200" aria-label="Entrar">
                  <User className="h-5 w-5 text-foreground" />
                </Link>
              )}

              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
                aria-label="Abrir carrinho"
              >
                <ShoppingBag className="h-5 w-5 text-foreground" />
                {totalItems > 0 ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                ) : null}
              </button>

              <button
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="px-4 py-4 space-y-3">
                <Link to="/" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Início
                </Link>
                <Link to="/produtos" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Produtos
                </Link>
                <Link to="/sobre" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Sobre
                </Link>
                <Link to="/login" className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  {isCustomerAuthenticated && userName ? `Minha conta (${userName})` : "Minha conta"}
                </Link>
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="block text-sm font-medium text-foreground py-2">
                  Instagram
                </a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
      <CartSheet />
    </>
  );
};

export default Navbar;
