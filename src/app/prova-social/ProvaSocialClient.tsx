'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X } from 'lucide-react';
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

const productHighlights = [
  {
    src: '/prova-social/02075985-293F-4C97-BAF2-2D55552C4798.JPG.jpeg',
    label: 'Design Premium',
    text: 'Acabamento impecável em cada detalhe, feito para quem não abre mão do melhor.'
  },
  {
    src: '/prova-social/3BCB50E4-C918-448D-911B-BEC540542A0A.JPG.jpeg',
    label: 'Exclusividade',
    text: 'Materiais selecionados que garantem uma estética refinada e superior.'
  },
  {
    src: '/prova-social/IMG_0011.JPG.jpeg',
    label: 'Experiência Única',
    text: 'O toque de sofisticação e tecnologia que transforma o seu dia a dia.'
  },
  {
    src: '/prova-social/IMG_0350.jpg',
    label: 'Alta Performance',
    text: 'A sintonia perfeita entre funcionalidade avançada e um visual moderno.'
  }
];

export default function ProvaSocialClient() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Efeito Parallax para o fundo e título
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yTitle = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Efeito Parallax e Scale para o Vídeo
  const scaleVideo = useTransform(scrollYProgress, [0, 0.4], [0.85, 1]);
  const opacityVideo = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      {/* Background blobs (Padrão JPB) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(225,171,45,0.15)_0%,rgba(225,171,45,0)_70%)] blur-3xl pointer-events-none" />

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 relative z-10">

        {/* Header Title com Parallax */}
        <motion.div
          style={{ y: yTitle, opacity: opacityTitle }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter mb-6 text-white"
          >
            A Experiência <span className="gold-text">JPBStoreX.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium"
          >
            Não vendemos apenas produtos. Entregamos a experiência premium que você sempre quis. Veja o que dizem sobre nós.
          </motion.p>
        </motion.div>

        {/* Hero Video Section com Efeitos Interativos */}
        <motion.section 
          style={{ scale: scaleVideo, opacity: opacityVideo }}
          className="mb-32 relative mx-auto w-fit max-w-[95%] group"
        >
          {/* Animated Spinning Border */}
          <div className="absolute -inset-1 rounded-[32px] overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-700">
             <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,#000000_0%,rgba(225,171,45,1)_50%,#000000_100%)] animate-spin [animation-duration:3s]" />
          </div>
          
          <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] shadow-2xl flex justify-center items-center p-[2px] z-10">
            <video 
              src="/prova-social/video_apresentacao.mp4" 
              autoPlay 
              loop 
              muted 
              playsInline
              controls
              className="max-h-[70vh] w-auto object-contain rounded-3xl"
            />
          </div>
        </motion.section>

        {/* Masonry Image Grid com Staggered Entrance e Textos */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Galeria <span className="gold-text">JPB</span></h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full opacity-70"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(300px,auto)] md:auto-rows-[400px] gap-6">
            {productHighlights.map((item, index) => {
              // Lógica para Layout Bento Box
              let bentoClasses = "";
              if (index === 0) bentoClasses = "md:col-span-2 md:row-span-2"; // Destaque principal
              else if (index === 1) bentoClasses = "md:col-span-1 md:row-span-1"; 
              else if (index === 2) bentoClasses = "md:col-span-1 md:row-span-1";
              else if (index === 3) bentoClasses = "md:col-span-2 md:row-span-1"; // Retângulo inferior

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative rounded-[32px] overflow-hidden group shadow-2xl bg-[#111] border border-white/10 ${bentoClasses} cursor-pointer`}
                  onClick={() => setSelectedImg(item.src)}
                >
                  <img
                    src={item.src}
                    alt={`Detalhe do Produto ${index + 1}`}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Glassmorphism Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out z-10">
                     <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-3xl">
                       <div className="inline-block bg-primary/20 border border-primary/30 text-primary px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(225,171,45,0.3)]">
                         {item.label}
                       </div>
                       <p className="text-zinc-200 text-sm md:text-[15px] leading-relaxed font-light">
                         {item.text}
                       </p>
                     </div>
                  </div>

                  {/* Ícone Indicador de Cursor (Ampliar) */}
                  <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md p-3.5 rounded-full opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 z-20 border border-white/20 shadow-xl">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Lightbox / Modal Minimalista e Premium */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[101] bg-white/5 hover:bg-white/20 border border-white/10 rounded-full p-3 backdrop-blur-xl"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImg(null);
              }}
            >
              <X size={24} />
            </motion.button>

            <motion.img
              initial={{ scale: 0.8, y: 50, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, y: 50, opacity: 0, rotate: 2 }}
              transition={{ type: "spring", damping: 20, stiffness: 150 }}
              src={selectedImg}
              alt="Ampliado"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
