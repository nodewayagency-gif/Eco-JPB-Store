import { prisma } from '../../infrastructure/database/prisma';

export interface CreateProductDTO {
  name: string;
  sku: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  stockQuantity: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  originZipCode: string;
  costPrice?: number;
  minStockAlert?: number;
  taxPercent?: number;
  images?: string[];
  variants?: any[];
}

export class CreateProductUseCase {
  async execute(data: CreateProductDTO) {
    const { id, category, variants, gatewayProductId, ...productData } = data as any;
    
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          price: Number(data.price),
          costPrice: data.costPrice ? Number(data.costPrice) : 0,
          stockQuantity: Number(data.stockQuantity),
          minStockAlert: Number(data.minStockAlert),
          weightKg: Number(data.weightKg),
          lengthCm: Number(data.lengthCm),
          widthCm: Number(data.widthCm),
          heightCm: Number(data.heightCm),
          taxPercent: data.taxPercent ? Number(data.taxPercent) : 0,
          slug: data.name.toLowerCase().replace(/ /g, '-'),
          images: data.images || [],
        },
      });

      if (data.variants && data.variants.length > 0) {
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: product.id,
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

      return product;
    });
  }
}
