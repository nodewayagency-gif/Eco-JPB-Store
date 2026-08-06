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

        {/* Hero Video Section com tamanho controlado (limitando a altura para não ficar enorme) */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="mb-32 relative mx-auto max-w-[90%] md:max-w-3xl group cursor-pointer"
        >
          {/* Efeito de brilho animado atrás do vídeo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-primary/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0a0a0a] border border-white/10 ring-1 ring-white/5 flex justify-center items-center">
            <video
              src="/prova-social/video_apresentacao.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full max-h-[70vh] object-contain scale-[1.02] group-hover:scale-100 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100"
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

          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {productHighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group shadow-xl mb-6 bg-[#111] border border-white/10 flex flex-col"
              >
                <div
                  className="relative w-full overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImg(item.src)}
                >
                  <img
                    src={item.src}
                    alt={`Detalhe do Produto ${index + 1}`}
                    className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Overlay Escuro ao passar o mouse */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-white font-medium bg-black/50 border border-white/20 px-6 py-3 rounded-full backdrop-blur-md text-sm uppercase tracking-widest flex items-center gap-2"
                    >
                      Ampliar
                    </motion.div>
                  </div>
                </div>

                {/* Área de Texto abaixo da Foto */}
                <div className="p-5 md:p-6 bg-gradient-to-b from-[#181818] to-[#0d0d0d] relative">
                  {/* Detalhe visual sutil */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Etiqueta / Tag */}
                  <div className="inline-block bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3">
                    {item.label}
                  </div>

                  <p className="text-zinc-300 text-sm md:text-[15px] leading-relaxed font-light">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
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
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              src={selectedImg}
              alt="Ampliado"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
