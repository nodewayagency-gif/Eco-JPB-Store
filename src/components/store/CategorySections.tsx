import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { name: "Headphones", slug: "headphones", image: "/categories/headphones.png" },
  { name: "Earbuds", slug: "earbuds", image: "/categories/earbuds.png" },
  { name: "Speakers", slug: "speakers", image: "/categories/speakers.png" },
  { name: "Smartwatch", slug: "smartwatch", image: "/categories/smartwatch.png" },
  { name: "Acessórios", slug: "acessorios", image: "/categories/accessories.png" },
];

const CategorySections = () => {
  return (
    <section className="py-12 bg-[#0a0a0a] border-b border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-start md:justify-center gap-8 md:gap-14 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={`/produtos?categoria=${category.slug}`} 
                className="group flex flex-col items-center gap-3 min-w-[80px]"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-primary/50 group-hover:scale-105">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-10 h-10 md:w-14 md:h-14 object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySections;
