import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

type Params = {
  id: string;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const { 
        code, 
        discountType, 
        discountValue, 
        minOrderValue, 
        maxUses, 
        active, 
        endDate 
    } = data;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discountType: discountType || undefined,
        discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
        minOrderValue: minOrderValue !== undefined ? (minOrderValue ? Number(minOrderValue) : null) : undefined,
        maxUses: maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : undefined,
        active: active !== undefined ? active : undefined,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined
      }
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ message: "Erro ao atualizar cupom" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ message: "Erro ao excluir cupom" }, { status: 500 });
  }
}
