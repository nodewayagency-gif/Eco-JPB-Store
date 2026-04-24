import type { Product } from "@premium/contracts";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
      "Imersão sonora absoluta com drivers de 40mm, ANC adaptativo e 38 horas de bateria.",
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
    description: "Liberdade sem fio com qualidade de estúdio e áudio espacial.",
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
    description: "Som de alta potência com design compacto e resistência IP67.",
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
    description: "Smartwatch premium com monitoramento avançado e autonomia prolongada.",
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
    description: "Headphone leve com conforto premium e excelente equilíbrio sonoro.",
    rating: 4.6,
    reviews: 687
  }
];

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const productImagePath = (image: string) => `/assets/products/${image}.png`;

export const productSlug = (product: Product) => `${slugify(product.name)}-${product.id}`;

export const findProductBySlug = (slug: string) => {
  const id = slug.split("-").pop();
  if (!id) return null;
  return products.find((product) => product.id === id) ?? null;
};

export const productHref = (product: Product) => `/produtos/${productSlug(product)}`;
