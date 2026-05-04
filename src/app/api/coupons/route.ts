import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Get coupons error:", error);
    return NextResponse.json({ message: "Erro ao listar cupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType: discountType || "PERCENTAGE",
        discountValue: discountValue || 0,
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        active: active !== undefined ? active : true,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ message: "Erro ao criar cupom" }, { status: 500 });
  }
}
