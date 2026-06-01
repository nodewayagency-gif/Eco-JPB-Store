import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { code, amount } = data;

    if (!code) {
      return NextResponse.json({ message: "Código do cupom é obrigatório" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json({ message: "Cupom não encontrado" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ message: "Este cupom está inativo" }, { status: 400 });
    }

    if (coupon.endDate && new Date() > new Date(coupon.endDate)) {
      return NextResponse.json({ message: "Este cupom já expirou" }, { status: 400 });
    }

    if (coupon.minOrderValue && amount < Number(coupon.minOrderValue)) {
      return NextResponse.json({ 
        message: `Este cupom exige um valor mínimo de compra de R$ ${Number(coupon.minOrderValue).toFixed(2).replace('.', ',')}` 
      }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ message: "Limite de uso deste cupom foi atingido" }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ message: "Erro ao validar cupom" }, { status: 500 });
  }
}
