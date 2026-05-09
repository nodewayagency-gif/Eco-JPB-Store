import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  description: string;
  badge?: string;
  colors: { name: string; hex: string }[];
  rating: number;
  reviews: number;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get<{ products: any[] }>('/products?active=true');
      const products = Array.isArray(data) ? data : data.products;
      
      // Mapeando os dados do banco para o formato que o frontend espera
      return products.map(p => ({
        ...p,
        category: p.category?.name || 'Geral',
        price: Number(p.price),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        colors: p.variants && p.variants.length > 0 
          ? p.variants.map((v: any) => ({ name: v.name, hex: v.colorHex || "#1D1D1F" }))
          : [{ name: "Padrão", hex: "#1D1D1F" }],
        rating: p.rating || 5.0,
        reviews: p.reviewCount || 0,
        image: p.image || (p.images && p.images.length > 0 ? p.images[0] : ""),
        specs: [
          { label: "Peso", value: `${p.weightKg}kg` },
          { label: "Dimensões", value: `${p.lengthCm}x${p.widthCm}x${p.heightCm} cm` },
          { label: "SKU", value: p.sku },
          { label: "NCM", value: p.ncm || "N/A" }
        ]
      })) as Product[];
    },
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<any>(`/products/${id}`);
      
      return {
        ...data,
        category: data.category?.name || 'Geral',
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        colors: data.variants && data.variants.length > 0 
          ? data.variants.map((v: any) => ({ name: v.name, hex: v.colorHex || "#1D1D1F" }))
          : [{ name: "Padrão", hex: "#1D1D1F" }],
        rating: data.rating || 5.0,
        reviews: data.reviewCount || 0,
        image: data.image || (data.images && data.images.length > 0 ? data.images[0] : ""),
        specs: [
          { label: "Peso", value: `${data.weightKg}kg` },
          { label: "Dimensões", value: `${data.lengthCm}x${data.widthCm}x${data.heightCm} cm` },
          { label: "SKU", value: data.sku },
          { label: "NCM", value: data.ncm || "N/A" }
        ]
      } as Product;
    },
    enabled: !!id,
  });
};
