import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';
    
    const products = await prisma.product.findMany({
      where: onlyActive ? { active: true } : {},
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        image: true,
        active: true,
        stockQuantity: true,
        category: true,
        badge: true,
        inStock: true,
        originalPrice: true,
        freeShipping: true,
        createdAt: true,
        variants: {
          select: {
            name: true,
            colorHex: true,
          }
        }
      },
      take: 50,
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    return NextResponse.json({ message: 'Erro ao listar produtos', error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, category, variants, gatewayProductId, ...productData } = data as any;
    
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          price: Number(data.price),
          costPrice: data.costPrice ? Number(data.costPrice) : 0,
          stockQuantity: Number(data.stockQuantity),
          minStockAlert: data.minStockAlert ? Number(data.minStockAlert) : 0,
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
              productId: newProduct.id,
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

      return newProduct;
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Erro ao criar produto', error: error.message }, { status: 500 });
  }
}
