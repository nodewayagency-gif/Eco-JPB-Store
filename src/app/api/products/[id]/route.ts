import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  props: { params: Promise<Params> }
) {
  const { id } = await props.params;

  try {
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
  } catch (error: any) {
    console.error(`Erro ao buscar produto ${id}:`, error);
    return NextResponse.json({
      message: 'Erro ao buscar produto'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<Params> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { id } = await props.params;
    const data = await request.json();
    const {
      id: _,
      category,
      variants,
      createdAt,
      updatedAt,
      reviews,
      orderItems,
      cartItems,
      ...updateData
    } = data as any;

    const product = await prisma.$transaction(async (tx) => {
      // 1. Atualizar o produto base
      const finalUpdateData = {
        ...updateData,
        categoryId: updateData.categoryId === "" ? null : updateData.categoryId,
        slug: data.name ? data.name.toLowerCase().replace(/ /g, '-') : undefined,
        price: data.price !== undefined ? Number(data.price) : undefined,
        originalPrice: data.originalPrice !== undefined ? (data.originalPrice ? Number(data.originalPrice) : null) : undefined,
        costPrice: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
        stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : undefined,
        minStockAlert: data.minStockAlert !== undefined ? Number(data.minStockAlert) : undefined,
        weightKg: data.weightKg !== undefined ? Number(data.weightKg) : undefined,
        lengthCm: data.lengthCm !== undefined ? Number(data.lengthCm) : undefined,
        widthCm: data.widthCm !== undefined ? Number(data.widthCm) : undefined,
        heightCm: data.heightCm !== undefined ? Number(data.heightCm) : undefined,
        taxPercent: data.taxPercent !== undefined ? Number(data.taxPercent) : undefined,
        images: data.images || undefined,
        topics: data.topics !== undefined ? data.topics : undefined,
        gatewayProductId: data.gatewayProductId || undefined,
      };

      const updatedProduct = await tx.product.update({
        where: { id },
        data: finalUpdateData,
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
          const variantSku = v.sku || `${productDataSku(updatedProduct.sku)}-${(v.name || 'VAR').substring(0, 3).toUpperCase()}`;

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                sku: variantSku,
                price: v.price !== undefined ? Number(v.price) : undefined,
                stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : 0,
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
                sku: variantSku,
                price: v.price !== undefined ? Number(v.price) : undefined,
                stockQuantity: v.stockQuantity !== undefined ? Number(v.stockQuantity) : 0,
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
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({
      message: 'Erro ao atualizar produto'
    }, { status: 500 });
  }
}

function productDataSku(sku: string | undefined): string {
  return sku || 'JPB-PROD';
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<Params> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || (authUser.role !== 'ADMIN' && authUser.role !== 'OPERATOR')) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const { id } = await props.params;
    await prisma.product.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json({ message: 'Erro ao deletar produto' }, { status: 500 });
  }
}
