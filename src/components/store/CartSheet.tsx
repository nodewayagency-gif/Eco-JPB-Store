import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/providers/CartContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { productImages } from "@/lib/productImages";
import { resolveProductImage } from "@/lib/imageResolver";

export const CartSheet = () => {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, setIsOpen } = useCart();
  const router = useRouter();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground font-bold text-lg">
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 opacity-30" />
            <p className="text-sm">Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 rounded-xl bg-secondary group/item relative"
                  >
                    <Link 
                      href={`/product/${item.product.id}`} 
                      className="absolute inset-0 z-10" 
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="h-20 w-20 rounded-lg bg-background flex items-center justify-center overflow-hidden flex-shrink-0 border border-border/50 relative z-20">
                      {resolveProductImage(item.product.image, item.product.images) ? (
                        <img
                          src={resolveProductImage(item.product.image, item.product.images)!}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1 transition-transform group-hover/item:scale-110"
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 relative z-20">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover/item:text-primary transition-colors">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight mt-0.5">
                        {item.selectedColor}
                      </p>
                      <p className="text-sm font-black text-primary mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-background rounded-lg border border-border/50 p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.product.id, item.quantity - 1);
                            }}
                            className="p-1 rounded-md hover:bg-accent transition-colors relative z-30"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.product.id, item.quantity + 1);
                            }}
                            className="p-1 rounded-md hover:bg-accent transition-colors relative z-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.product.id);
                          }}
                          className="ml-auto p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors relative z-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <Button
                className="w-full shimmer-btn h-12 rounded-xl text-sm font-semibold"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/checkout");
                }}
              >
                Finalizar Compra
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
