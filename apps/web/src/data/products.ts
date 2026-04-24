import type { Product } from "@premium/contracts";
export type { Product } from "@premium/contracts";

export const products: Product[] = [
  {
    id: "1",
    name: "JPB Studio Pro",
    category: "Headphones",
    price: 1899.9,
    originalPrice: 2199.9,
    image: "hero-headphones",
    badge: "Premium",
    inStock: true,
    colors: [
      { name: "Preto", hex: "#1D1D1F" },
      { name: "Prata", hex: "#C0C0C0" },
      { name: "Azul", hex: "#007AFF" }
    ],
    specs: [
      { label: "Driver", value: "40mm Neodímio" },
      { label: "Resposta de Frequência", value: "4Hz - 40kHz" },
      { label: "Impedância", value: "32 Ohms" },
      { label: "Bateria", value: "38h de reprodução" },
      { label: "Cancelamento de Ruído", value: "ANC Adaptativo" },
      { label: "Conectividade", value: "Bluetooth 5.3, USB-C" }
    ],
    description:
      "Imersão sonora absoluta. O JPB Studio Pro redefine o que significa ouvir música com drivers de 40mm, cancelamento de ruído adaptativo e 38 horas de bateria.",
    rating: 4.9,
    reviews: 2847
  },
  {
    id: "2",
    name: "JPB Air Elite",
    category: "Earbuds",
    price: 999.9,
    image: "product-earbuds",
    badge: "Novo",
    inStock: true,
    colors: [
      { name: "Branco", hex: "#F5F5F7" },
      { name: "Preto", hex: "#1D1D1F" }
    ],
    specs: [
      { label: "Driver", value: "11mm Custom" },
      { label: "ANC", value: "Híbrido Ativo" },
      { label: "Bateria", value: "8h (32h com case)" },
      { label: "Resistência", value: "IPX5" },
      { label: "Conectividade", value: "Bluetooth 5.3" }
    ],
    description:
      "Liberdade sem fio com qualidade de estúdio. ANC híbrido, áudio espacial e design ultra-confortável para o dia inteiro.",
    rating: 4.8,
    reviews: 1523
  },
  {
    id: "3",
    name: "JPB SoundCore X",
    category: "Speaker",
    price: 1299.9,
    image: "product-speaker",
    badge: "Limited",
    inStock: false,
    colors: [
      { name: "Preto", hex: "#1D1D1F" },
      { name: "Grafite", hex: "#4A4A4A" }
    ],
    specs: [
      { label: "Potência", value: "60W RMS" },
      { label: "Bateria", value: "24h" },
      { label: "Resistência", value: "IP67" },
      { label: "Conectividade", value: "Bluetooth 5.3, Wi-Fi" }
    ],
    description:
      "Som que preenche qualquer ambiente. 60W de potência pura em um design compacto e resistente à água.",
    rating: 4.7,
    reviews: 892
  },
  {
    id: "4",
    name: "JPB Chrono Ultra",
    category: "Smartwatch",
    price: 2499.9,
    originalPrice: 2899.9,
    image: "product-watch",
    badge: "Premium",
    inStock: true,
    colors: [
      { name: "Prata", hex: "#C0C0C0" },
      { name: "Preto", hex: "#1D1D1F" },
      { name: "Dourado", hex: "#C8A951" }
    ],
    specs: [
      { label: "Tela", value: "1.9\" AMOLED 60Hz" },
      { label: "Bateria", value: "14 dias" },
      { label: "Sensores", value: "SpO2, ECG, Temp." },
      { label: "Resistência", value: "10ATM" },
      { label: "GPS", value: "Dual-Band L1+L5" }
    ],
    description:
      "Precisão e elegância no seu pulso. Tela AMOLED de 1.9\", monitoramento avançado de saúde e 14 dias de bateria.",
    rating: 4.8,
    reviews: 1204
  },
  {
    id: "5",
    name: "JPB Studio Lite",
    category: "Headphones",
    price: 1199.9,
    image: "product-headphones-white",
    inStock: true,
    colors: [
      { name: "Branco", hex: "#F5F5F7" },
      { name: "Rosa", hex: "#F5C6CB" }
    ],
    specs: [
      { label: "Driver", value: "35mm" },
      { label: "Bateria", value: "28h" },
      { label: "ANC", value: "Passivo" },
      { label: "Peso", value: "210g" }
    ],
    description:
      "Leveza e qualidade sonora premium. Design minimalista com conforto para uso prolongado.",
    rating: 4.6,
    reviews: 687
  }
];
