import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-[#0a0a0a] pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-background/50 pointer-events-none" />
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="order-2 lg:order-1 max-w-[560px] text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase text-primary mb-6">
                Destaque em áudio premium
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.92] tracking-[-0.03em] text-foreground">
                O Som
                <br />
                <span className="gold-text">Perfeito.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              className="mt-6 max-w-md text-sm sm:text-lg text-muted-foreground leading-relaxed"
            >
              Fones premium para quem exige potência, conforto e clareza absoluta. Descubra também smartwatches,
              speakers e acessórios com padrão JPB.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mt-8"
            >
              <Link to="/produtos" className="inline-block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-[260px] h-11 rounded-full bg-primary text-black hover:bg-primary/90 font-semibold text-base"
                >
                  Explorar catálogo
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1, ease: "easeOut" }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[560px] lg:h-[560px] bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.32)_0%,rgba(225,171,45,0.08)_35%,rgba(225,171,45,0)_72%)] blur-2xl rounded-full" />
              <motion.img
                src="/jpb_sem_fundo.png"
                alt="Logo JPB Store"
                className="relative w-[220px] sm:w-[300px] lg:w-[460px] object-contain"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
