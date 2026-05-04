import { prisma } from '../../infrastructure/database/prisma';

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  stockQuantity?: number;
  costPrice?: number;
  minStockAlert?: number;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  taxPercent?: number;
  active?: boolean;
  images?: string[];
  variants?: {
    id?: string;
    name: string;
    sku: string;
    price?: number;
    stockQuantity?: number;
    colorHex?: string;
    image?: string;
    active?: boolean;
  }[];
}

export class UpdateProductUseCase {
  async execute(id: string, data: UpdateProductDTO) {
    const { id: _, category, variants, gatewayProductId, ...updateData } = data as any;
    
    return await prisma.$transaction(async (tx) => {
      // 1. Atualizar o produto base
      const product = await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          price: data.price ? Number(data.price) : undefined,
          costPrice: data.costPrice ? Number(data.costPrice) : undefined,
          stockQuantity: data.stockQuantity ? Number(data.stockQuantity) : undefined,
          minStockAlert: data.minStockAlert ? Number(data.minStockAlert) : undefined,
          weightKg: data.weightKg ? Number(data.weightKg) : undefined,
          lengthCm: data.lengthCm ? Number(data.lengthCm) : undefined,
          widthCm: data.widthCm ? Number(data.widthCm) : undefined,
          heightCm: data.heightCm ? Number(data.heightCm) : undefined,
          taxPercent: data.taxPercent ? Number(data.taxPercent) : undefined,
          images: data.images || undefined,
        },
      });

      // 2. Sincronizar variantes se fornecidas
      if (data.variants) {
        const variantIds = data.variants.map(v => v.id).filter(Boolean) as string[];
        
        // Deletar variantes que não estão mais no payload
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: variantIds }
          }
        });

        // Criar ou Atualizar cada variante
        for (const v of data.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                sku: v.sku,
                price: v.price ? Number(v.price) : undefined,
                stockQuantity: v.stockQuantity ? Number(v.stockQuantity) : undefined,
                colorHex: v.colorHex,
                image: v.image,
                active: v.active ?? true,
              }
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name,
                sku: v.sku,
                price: v.price ? Number(v.price) : undefined,
                stockQuantity: v.stockQuantity ? Number(v.stockQuantity) : 0,
                colorHex: v.colorHex,
                image: v.image,
                active: v.active ?? true,
              }
            });
          }
        }
      }

      return product;
    });
  }
}
