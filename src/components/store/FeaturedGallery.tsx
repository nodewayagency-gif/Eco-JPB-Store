'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FeaturedGallery() {
  const featuredImages = [
    '/prova-social/02075985-293F-4C97-BAF2-2D55552C4798.JPG.jpeg',
    '/prova-social/IMG_0011.JPG.jpeg',
    '/prova-social/IMG_0350.jpg'
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden border-t border-white/5">
      {/* Glow Effect Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.08)_0%,rgba(225,171,45,0)_70%)] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Text Content */}
          <div className="lg:w-5/12 space-y-8 text-center lg:text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Beleza e perfeição <span className="gold-text">em cada detalhe.</span>
              </h2>
              <p className="text-zinc-400 mt-6 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Os nossos produtos são projetados para elevar sua experiência. Do acabamento de ponta ao design inconfundível, descubra o porquê somos a escolha premium.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link 
                href="/prova-social" 
                className="inline-flex items-center gap-3 text-primary font-bold hover:text-white transition-colors duration-300 text-lg group bg-white/5 border border-white/10 px-6 py-3 rounded-full"
              >
                Ver clientes usando
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Image Collage (3 fotos) */}
          <div className="lg:w-7/12 relative min-h-[450px] md:min-h-[550px] w-full flex justify-center items-center mt-10 lg:mt-0">
            
            {/* Image 1 (Left - Back) */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 20, rotate: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-0 md:left-4 top-4 md:top-12 w-40 md:w-56 z-10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <img 
                src={featuredImages[0]} 
                alt="Detalhe Produto 1" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Image 3 (Right - Back) */}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 20, rotate: -10 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 8 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="absolute right-0 md:right-4 bottom-12 md:bottom-20 w-44 md:w-60 z-10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
              <img 
                src={featuredImages[2]} 
                alt="Detalhe Produto 3" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>

            {/* Image 2 (Center - Front) */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute z-30 w-52 md:w-72 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-primary/30 group cursor-pointer top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <img 
                src={featuredImages[1]} 
                alt="Detalhe Produto 2" 
                className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
