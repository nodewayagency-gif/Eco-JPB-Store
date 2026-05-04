import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json({ message: 'Erro ao buscar produto', error }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { id: _, category, variants, ...updateData } = data as any;
    
    const product = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o produto base
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          slug: data.name ? data.name.toLowerCase().replace(/ /g, '-') : undefined,
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
          gatewayProductId: data.gatewayProductId || undefined,
        },
      });

      // 2. Sincronizar variantes se fornecidas
      if (data.variants) {
        const variantIds = data.variants.map((v: any) => v.id).filter(Boolean) as string[];
        
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: variantIds }
          }
        });

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

      return updatedProduct;
    });
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Erro ao atualizar produto', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Erro ao deletar produto', error }, { status: 500 });
  }
}
