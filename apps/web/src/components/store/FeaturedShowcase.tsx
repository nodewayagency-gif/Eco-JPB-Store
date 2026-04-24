import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Battery, Radio, Volume2 } from "lucide-react";

const FeaturedShowcase = () => {
  return (
    <section className="py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative rounded-[2rem] overflow-hidden bg-[linear-gradient(135deg,#111111_0%,#050505_100%)] border border-white/5 p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Back Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.1)_0%,transparent_70%)] blur-3xl pointer-events-none" />

          {/* Info */}
          <div className="flex-1 space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-6 uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full text-[10px]">
                Edição Limitada Gold
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-[1.05] tracking-tight">
                JPB Studio <br /> <span className="gold-text italic">Pro Max</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Battery className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Bateria</p>
                  <p className="text-sm font-bold text-foreground">38 Horas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Wireless</p>
                  <p className="text-sm font-bold text-foreground">5.3 Hifi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Volume2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Audio</p>
                  <p className="text-sm font-bold text-foreground">Hi-Res</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <Link to="/product/1" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 w-full sm:w-[260px] shimmer-btn rounded-xl gap-2 font-black text-base">
                  <ShoppingCart className="h-5 w-5" /> Adquira por R$ 1.899
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground font-medium">Garanta o seu antes que esgote.</p>
            </motion.div>
          </div>

          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.2)_0%,transparent_70%)] blur-3xl" />
            <img 
              src="/jpb_sem_fundo.png" 
              alt="JPB Studio Pro Max" 
              className="relative w-full max-w-[500px] object-contain drop-shadow-[0_20px_50px_rgba(225,171,45,0.3)]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Badge = ({ children, variant, className }: any) => (
    <span className={`inline-flex items-center ${className}`}>
        {children}
    </span>
);

export default FeaturedShowcase;
