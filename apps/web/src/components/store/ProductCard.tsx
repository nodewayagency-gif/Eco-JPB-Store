import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/products";
import { productImages } from "@/lib/productImages";

interface ProductCardProps {
  product: Product;
  index: number;
}

const badgeStyles: Record<string, string> = {
  Premium: "bg-primary text-primary-foreground",
  Limited: "bg-accent text-accent-foreground",
  Novo: "bg-primary/15 text-primary border border-primary/30",
};

const ProductCard = ({ product, index }: ProductCardProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <Link to={`/product/${product.id}`} className="group block relative">
        <div className="absolute -inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.30)_0%,rgba(225,171,45,0)_68%)] blur-2xl" />
        </div>

        <div className="relative z-10 premium-card rounded-2xl overflow-hidden">

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeStyles[product.badge] || ""}`}>
                {product.badge}
              </Badge>
            </div>
          )}

          {/* Stock badge */}
          {!product.inStock && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="text-[10px] font-medium px-2 py-1 rounded-full bg-secondary/80 text-muted-foreground backdrop-blur-sm">
                Esgotado
              </Badge>
            </div>
          )}

          {/* Image */}
          <div className="aspect-square flex items-center justify-center p-8 md:p-14 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img
              src={productImages[product.image]}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:-rotate-2 drop-shadow-md group-hover:drop-shadow-[0_20px_30px_rgba(225,171,45,0.15)]"
            />
          </div>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              Ver Detalhes
            </div>
          </div>
        </div>


        {/* Info */}
        <div className="mt-5 space-y-2 px-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.15em]">{product.category}</p>
            <div className="flex gap-1">
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="h-2 w-2 rounded-full border border-white/10"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through opacity-60 font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.price > 500 && (
              <span className="ml-auto text-[9px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Frete Grátis
              </span>
            )}
          </div>
        </div>

      </Link>
    </motion.div>
  );
};

export default ProductCard;
