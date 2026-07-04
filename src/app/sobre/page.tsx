'use client';

import { motion } from "framer-motion";
import { Award, Headphones, Heart, Shield, Target, Users } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

const values = [
  { icon: Headphones, title: "Qualidade Sonora", desc: "Engenharia acústica de precisão em cada produto que desenvolvemos." },
  { icon: Shield, title: "Garantia Premium", desc: "6 meses de garantia completa em todos os nossos dispositivos." },
  { icon: Heart, title: "Paixão por Tecnologia", desc: "A melhor experiência" },
  { icon: Target, title: "Inovação Constante", desc: "Investimos em tecnologia de ponta para superar expectativas." },
];

const milestones = [
  { year: "2022", title: "Fundação JPB", desc: "A JPBStore nasceu com o propósito de oferecer A Melhor experiência com produtos que todo mundo um dia já quis ter." },
  { year: "2022", title: "Primeiro Produto", desc: "Lançamento do AirPods RP Premium, um dos produtos que se tornou referência entre nossos clientes pela sua qualidade, acabamento e experiência de uso." },
  { year: "2023", title: "Expansão", desc: "Ampliação do catálogo com uma linha completa de acessórios e produtos compatíveis com o ecossistema Apple, atendendo às principais necessidades dos nossos clientes." },
  { year: "2024", title: "12.000+ Clientes", desc: "Mais de 12 mil clientes atendidos em todo o território nacional, com envios para todas as regiões do Brasil e milhares de avaliações positivas." },
  { year: "2025", title: "Lançamento da Nova Plataforma", desc: "Inauguração do novo site da JPB Store, criado para reunir os produtos mais desejados do mercado com foco em Acessórios, presamos sempre pela qualidade, confiança e excelente experiência de compra." },
  { year: "2026", title: "Consolidação", desc: "O AirPods Pro RP Premium se consolida como um dos produtos mais vendidos da JPBStore. 🏆" },
];

const stats = [
  { value: "10K+", label: "Clientes Satisfeitos" },
  { value: "4.8★", label: "Avaliação Média" },
  { value: "6 Meses", label: "Garantia JPB" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-4 md:px-8 text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-semibold tracking-widest uppercase gold-text">Sobre Nós</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mt-3">
              A Arte do <span className="gold-text">Som Perfeito</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              Na JPBStore, Acreditamos que sua experiência é prioridade. Nossa missão é criar dispositivos que conectem você a melhor experiência possível.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 md:px-8 mb-20">
          <div className="flex flex-wrap justify-center gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-6 text-center w-[calc(50%-0.5rem)] sm:w-48 md:w-56"
              >
                <p className="text-2xl md:text-3xl font-black gold-text">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 md:px-8 mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-foreground text-center mb-12"
          >
            Nossos <span className="gold-text">Valores</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border/50 rounded-2xl p-6 group hover:border-primary/30 transition-colors duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container mx-auto px-4 md:px-8 mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-foreground text-center mb-12"
          >
            Nossa <span className="gold-text">Trajetória</span>
          </motion.h2>
          <div className="max-w-2xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <motion.div
                key={`${m.year}-${m.title}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-10 pb-10 last:pb-0"
              >
                <div className="absolute left-0 top-0 h-full w-px bg-border last:bg-transparent" />
                <div className="absolute left-[-4px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                <span className="text-xs font-bold gold-text tracking-wider">{m.year}</span>
                <h3 className="font-semibold text-foreground mt-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="container mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-primary/20 rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <Award className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
              Compromisso com a <span className="gold-text">Excelência</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cada produto JPB passa por rigorosos testes de qualidade antes de chegar até você.
              Utilizamos materiais premium, drivers de alta fidelidade e tecnologia de ponta
              para garantir que sua experiência sonora seja sempre excepcional.
              Seu som, nossa obsessão.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
